import { supabase } from '../lib/supabase';
import { FMSStep, FMSTemplate, Project, ProjectTask, Log, User } from '../types';

export const api = {
  // Authentication
  async login(username: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { success: false, message: 'Invalid username or password' };
      }

      return { success: true, user: data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  // Users
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, users: data || [] };
    } catch (error: any) {
      return { success: false, message: error.message, users: [] };
    }
  },

  async getAllUsers() {
    return this.getUsers();
  },

  async createUser(...args: any[]) {
    try {
      let userData: any;

      if (args.length === 1 && typeof args[0] === 'object') {
        userData = args[0];
      } else {
        const [username, password, name, role, department] = args;
        userData = { username, password, name, role, department };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, user: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async updateUser(id: string | number, updates: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, user: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async deleteUser(id: string | number) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Departments
  async getAllDepartments() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('department');

      if (error) throw error;

      const departments = Array.from(
        new Set(data?.map((u: any) => u.department).filter(Boolean) || [])
      );

      return { success: true, departments };
    } catch (error: any) {
      return { success: true, departments: [] };
    }
  },

  // FMS Templates
  async createFMS(fmsName: string, steps: FMSStep[], username: string) {
    try {
      // Create FMS template
      const { data: fmsData, error: fmsError } = await supabase
        .from('fms_templates')
        .insert([{ fms_name: fmsName, created_by: username }])
        .select()
        .single();

      if (fmsError) throw fmsError;

      // Create FMS steps
      const stepsData = steps.map((step) => ({
        fms_id: fmsData.id,
        step_no: step.stepNo,
        what: step.what,
        who: step.who,
        how: step.how,
        when: step.when,
      }));

      const { error: stepsError } = await supabase
        .from('fms_steps')
        .insert(stepsData);

      if (stepsError) throw stepsError;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          type: 'FMS_CREATED',
          fms_id: fmsData.id,
          fms_name: fmsName,
          created_by: username,
        },
      ]);

      return { success: true, fmsId: fmsData.id };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async getAllFMS() {
    try {
      const { data, error } = await supabase
        .from('fms_templates')
        .select('id, fms_name, created_by, created_at, fms_steps(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fmsList: FMSTemplate[] = data.map((fms: any) => ({
        fmsId: fms.id,
        fmsName: fms.fms_name,
        stepCount: fms.fms_steps[0]?.count || 0,
        createdBy: fms.created_by,
        createdOn: fms.created_at,
      }));

      return { success: true, fmsList };
    } catch (error: any) {
      return { success: false, message: error.message, fmsList: [] };
    }
  },

  async getFMSById(fmsId: string) {
    try {
      const { data: fmsData, error: fmsError } = await supabase
        .from('fms_templates')
        .select('*, fms_steps(*)')
        .eq('id', fmsId)
        .single();

      if (fmsError) throw fmsError;

      return {
        success: true,
        fms: {
          fmsName: fmsData.fms_name,
          steps: fmsData.fms_steps.sort((a: any, b: any) => a.step_no - b.step_no),
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Projects
  async createProject(fmsId: string, projectName: string, projectStartDate: string, username: string) {
    try {
      // Get FMS steps
      const { data: steps, error: stepsError } = await supabase
        .from('fms_steps')
        .select('*')
        .eq('fms_id', fmsId)
        .order('step_no');

      if (stepsError) throw stepsError;

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            fms_id: fmsId,
            project_name: projectName,
            start_date: projectStartDate,
            created_by: username,
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // Create project tasks
      const startDate = new Date(projectStartDate);
      let cumulativeDays = 0;

      const tasksData = steps.map((step: any, index: number) => {
        const dueDate = new Date(startDate);
        cumulativeDays += step.when;
        dueDate.setDate(startDate.getDate() + cumulativeDays);

        return {
          project_id: project.id,
          step_no: step.step_no,
          what: step.what,
          who: step.who,
          how: step.how,
          planned_due_date: dueDate.toISOString().split('T')[0],
          status: index === 0 ? 'Pending' : 'Pending',
          row_index: index + 1,
        };
      });

      const { error: tasksError } = await supabase
        .from('project_tasks')
        .insert(tasksData);

      if (tasksError) throw tasksError;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          type: 'PROJECT_CREATED',
          project_id: project.id,
          project_name: projectName,
          created_by: username,
        },
      ]);

      return { success: true, projectId: project.id };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async getAllProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_tasks(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects: Project[] = data.map((project: any) => ({
        projectId: project.id,
        fmsId: project.fms_id,
        projectName: project.project_name,
        tasks: project.project_tasks
          .sort((a: any, b: any) => a.step_no - b.step_no)
          .map((task: any) => ({
            rowIndex: task.row_index,
            projectId: project.id,
            projectName: project.project_name,
            stepNo: task.step_no,
            what: task.what,
            who: task.who,
            how: task.how,
            plannedDueDate: task.planned_due_date,
            actualCompletedOn: task.actual_completed_on,
            status: task.status,
          })),
      }));

      return { success: true, projects };
    } catch (error: any) {
      return { success: false, message: error.message, projects: [] };
    }
  },

  async getProjectsByUser(username: string) {
    try {
      // Get user's department
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('department')
        .eq('username', username)
        .maybeSingle();

      if (userError) throw userError;

      const department = userData?.department;

      // Get tasks assigned to user's department
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*, projects(project_name)')
        .eq('who', department)
        .order('planned_due_date');

      if (tasksError) throw tasksError;

      const projectTasks: ProjectTask[] = tasks.map((task: any) => ({
        rowIndex: task.row_index,
        projectId: task.project_id,
        projectName: task.projects?.project_name || 'Unknown',
        stepNo: task.step_no,
        what: task.what,
        who: task.who,
        how: task.how,
        plannedDueDate: task.planned_due_date,
        actualCompletedOn: task.actual_completed_on,
        status: task.status,
      }));

      return { success: true, tasks: projectTasks };
    } catch (error: any) {
      return { success: false, message: error.message, tasks: [] };
    }
  },

  async updateTaskStatus(rowIndex: number, status: string, username: string) {
    try {
      const { data: task, error: taskError } = await supabase
        .from('project_tasks')
        .select('*, projects(project_name)')
        .eq('row_index', rowIndex)
        .single();

      if (taskError) throw taskError;

      const updates: any = { status };
      if (status === 'Done') {
        updates.actual_completed_on = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('row_index', rowIndex);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          type: 'TASK_UPDATED',
          project_id: task.project_id,
          project_name: task.projects?.project_name,
          step_no: task.step_no,
          what: task.what,
          status,
          updated_by: username,
        },
      ]);

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Logs
  async getAllLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const logs: Log[] = data.map((log: any) => ({
        type: log.type,
        fmsId: log.fms_id,
        fmsName: log.fms_name,
        projectId: log.project_id,
        projectName: log.project_name,
        stepNo: log.step_no,
        what: log.what,
        status: log.status,
        createdBy: log.created_by,
        createdOn: log.created_at,
        updatedBy: log.updated_by,
        updatedOn: log.created_at,
      }));

      return { success: true, logs };
    } catch (error: any) {
      return { success: false, message: error.message, logs: [] };
    }
  },

  async getLogs() {
    return this.getAllLogs();
  },
};

export default api;
