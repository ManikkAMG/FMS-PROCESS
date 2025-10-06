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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8" />
          Dashboard
        </h1>

        <div className="border-b border-slate-200 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 min-w-max">
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`pb-3 px-3 sm:px-4 font-medium transition-colors relative text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'my-tasks'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Tasks ({myTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('all-projects')}
              className={`pb-3 px-3 sm:px-4 font-medium transition-colors relative text-sm sm:text-base whitespace-nowrap ${
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
              <div className="text-center py-8 sm:py-12">
                <ListChecks className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4 text-sm sm:text-base">No tasks assigned to you</p>
                <button
                  onClick={() => navigate('/start-project')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base"
                >
                  Start New Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div
                    key={`${task.projectId}-${task.stepNo}`}
                    className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-base sm:text-lg">
                          {task.projectName} - Step {task.stepNo}
                        </h3>
                        <p className="text-slate-600 mt-1 text-sm sm:text-base">{task.what}</p>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          task.status
                        )} self-start`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="break-words">
                          <strong>Who:</strong> {task.who}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="break-words">
                          <strong>Due:</strong> {formatDate(task.plannedDueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-50 rounded-lg text-xs sm:text-sm">
                      <strong className="text-slate-700">How:</strong>
                      <p className="text-slate-600 mt-1 break-words">{task.how}</p>
                    </div>

                    {task.status !== 'Done' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => updateStatus(task, 'In Progress')}
                          disabled={updating === task.rowIndex || task.status === 'In Progress'}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
                        >
                          {updating === task.rowIndex ? 'Updating...' : 'Start'}
                        </button>
                        <button
                          onClick={() => updateStatus(task, 'Done')}
                          disabled={updating === task.rowIndex}
                          className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
                        >
                          {updating === task.rowIndex ? 'Updating...' : 'Complete'}
                        </button>
                      </div>
                    )}

                    {task.actualCompletedOn && (
                      <div className="mt-2 text-xs sm:text-sm text-green-600">
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
              <div className="text-center py-8 sm:py-12">
                <ListChecks className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4 text-sm sm:text-base">No projects started yet</p>
                <button
                  onClick={() => navigate('/start-project')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base"
                >
                  Start New Project
                </button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {allProjects.map((project) => (
                  <div key={project.projectId} className="border border-slate-200 rounded-lg p-3 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
                      {project.projectName}
                    </h3>

                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <table className="w-full text-xs sm:text-sm min-w-max">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Step
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Task
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Assigned To
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Due Date
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              Completed
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {project.tasks.map((task) => (
                            <tr key={task.stepNo} className="hover:bg-slate-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">{task.stepNo}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 max-w-xs truncate">{task.what}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{task.who}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    task.status
                                  )} whitespace-nowrap`}
                                >
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{formatDate(task.plannedDueDate)}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
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
