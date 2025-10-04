import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Loader, Calendar, User, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectTask, Project } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState<ProjectTask[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'all-projects'>('my-tasks');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        api.getProjectsByUser(user!.username),
        api.getAllProjects(),
      ]);

      if (tasksResult.success) {
        setMyTasks(tasksResult.tasks);
      }

      if (projectsResult.success) {
        setAllProjects(projectsResult.projects);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (task: ProjectTask, newStatus: string) => {
    if (!task.rowIndex) return;

    setUpdating(task.rowIndex);
    try {
      const result = await api.updateTaskStatus(task.rowIndex, newStatus, user!.username);

      if (result.success) {
        await loadData();
      } else {
        setError(result.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <CheckSquare className="w-8 h-8" />
          Dashboard
        </h1>

        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'my-tasks'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Tasks ({myTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('all-projects')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'all-projects'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Projects ({allProjects.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'my-tasks' && (
          <div>
            {myTasks.length === 0 ? (
              <div className="text-center py-12">
                <ListChecks className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No tasks assigned to you</p>
                <button
                  onClick={() => navigate('/start-project')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Start New Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div
                    key={`${task.projectId}-${task.stepNo}`}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {task.projectName} - Step {task.stepNo}
                        </h3>
                        <p className="text-slate-600 mt-1">{task.what}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>Who:</strong> {task.who}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Due:</strong> {formatDate(task.plannedDueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                      <strong className="text-slate-700">How:</strong>
                      <p className="text-slate-600 mt-1">{task.how}</p>
                    </div>

                    {task.status !== 'Done' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(task, 'In Progress')}
                          disabled={updating === task.rowIndex || task.status === 'In Progress'}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {updating === task.rowIndex ? 'Updating...' : 'Start'}
                        </button>
                        <button
                          onClick={() => updateStatus(task, 'Done')}
                          disabled={updating === task.rowIndex}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {updating === task.rowIndex ? 'Updating...' : 'Complete'}
                        </button>
                      </div>
                    )}

                    {task.actualCompletedOn && (
                      <div className="mt-2 text-sm text-green-600">
                        Completed on: {formatDate(task.actualCompletedOn)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-projects' && (
          <div>
            {allProjects.length === 0 ? (
              <div className="text-center py-12">
                <ListChecks className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No projects started yet</p>
                <button
                  onClick={() => navigate('/start-project')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Start New Project
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {allProjects.map((project) => (
                  <div key={project.projectId} className="border border-slate-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {project.projectName}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Step
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Task
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Assigned To
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Due Date
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Completed
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {project.tasks.map((task) => (
                            <tr key={task.stepNo} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium">{task.stepNo}</td>
                              <td className="px-4 py-3">{task.what}</td>
                              <td className="px-4 py-3">{task.who}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">{formatDate(task.plannedDueDate)}</td>
                              <td className="px-4 py-3">
                                {task.actualCompletedOn
                                  ? formatDate(task.actualCompletedOn)
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
