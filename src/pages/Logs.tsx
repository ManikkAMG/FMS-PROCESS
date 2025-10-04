import { useState, useEffect } from 'react';
import { FileText, Loader, GitBranch, PlayCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Log } from '../types';

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await api.getAllLogs();
      if (result.success) {
        setLogs(result.logs);
      } else {
        setError('Failed to load logs');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'FMS_CREATED':
        return <GitBranch className="w-5 h-5 text-blue-600" />;
      case 'PROJECT_CREATED':
        return <PlayCircle className="w-5 h-5 text-green-600" />;
      case 'TASK_UPDATED':
        return <CheckCircle className="w-5 h-5 text-slate-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'FMS_CREATED':
        return 'bg-blue-50 border-blue-200';
      case 'PROJECT_CREATED':
        return 'bg-green-50 border-green-200';
      case 'TASK_UPDATED':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getLogTitle = (log: Log) => {
    switch (log.type) {
      case 'FMS_CREATED':
        return `FMS Template Created: ${log.fmsName}`;
      case 'PROJECT_CREATED':
        return `Project Started: ${log.projectName}`;
      case 'TASK_UPDATED':
        return `Task Updated: ${log.projectName} - Step ${log.stepNo}`;
      default:
        return 'Unknown Action';
    }
  };

  const getLogDescription = (log: Log) => {
    switch (log.type) {
      case 'FMS_CREATED':
        return `Created by ${log.createdBy}`;
      case 'PROJECT_CREATED':
        return `Started by ${log.createdBy}`;
      case 'TASK_UPDATED':
        return `${log.what} - Status: ${log.status} - Updated by ${log.updatedBy}`;
      default:
        return '';
    }
  };

  const getLogDate = (log: Log) => {
    return formatDate(log.createdOn || log.updatedOn || '');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
          Activity Logs
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-sm sm:text-base">No activity logs yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 sm:p-4 ${getLogColor(log.type)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="mt-0.5 sm:mt-1 flex-shrink-0">{getLogIcon(log.type)}</div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base break-words">
                      {getLogTitle(log)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2 break-words">
                      {getLogDescription(log)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getLogDate(log)}
                    </p>
                  </div>

                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:block whitespace-nowrap">
                    {log.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
