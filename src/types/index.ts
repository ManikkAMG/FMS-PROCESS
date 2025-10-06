export interface FMSStep {
  stepNo: number;
  what: string;
  who: string;
  how: string;
  when: number;
  whenUnit: 'days' | 'hours' | 'days+hours';
  whenDays?: number;
  whenHours?: number;
}

export interface FMSTemplate {
  fmsId: string;
  fmsName: string;
  stepCount: number;
  createdBy: string;
  createdOn: string;
}

export interface FMSDetail {
  fmsName: string;
  steps: FMSStep[];
}

export interface ProjectTask {
  rowIndex?: number;
  projectId: string;
  projectName: string;
  stepNo: number;
  what: string;
  who: string;
  how: string;
  plannedDueDate: string;
  actualCompletedOn: string;
  status: 'Pending' | 'In Progress' | 'Done';
  completedBy?: string;
  isFirstStep?: boolean;
  isOverdue?: boolean;
  completionStatus?: 'on-time' | 'late';
}

export interface Project {
  projectId: string;
  fmsId: string;
  projectName: string;
  tasks: ProjectTask[];
}

export interface Log {
  type: 'FMS_CREATED' | 'PROJECT_CREATED' | 'TASK_UPDATED';
  fmsId?: string;
  fmsName?: string;
  projectId?: string;
  projectName?: string;
  stepNo?: number;
  what?: string;
  status?: string;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface User {
  username: string;
  name: string;
  role: string;
  department: string;
  loginTime?: string;
}
