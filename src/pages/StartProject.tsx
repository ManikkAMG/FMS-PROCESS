import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FMSTemplate } from '../types';

export default function StartProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fmsList, setFmsList] = useState<FMSTemplate[]>([]);
  const [selectedFMS, setSelectedFMS] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [loadingFMS, setLoadingFMS] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFMSList();
  }, []);

  const loadFMSList = async () => {
    try {
      setLoadingFMS(true);
      const result = await api.getAllFMS();
      if (result.success) {
        setFmsList(result.fmsList || []);
      }
    } catch (err) {
      setError('Failed to load FMS templates');
      console.error('Error loading FMS templates:', err);
    } finally {
      setLoadingFMS(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFMS) {
      setError('Please select an FMS template');
      return;
    }

    if (!projectName.trim()) {
      setError('Please enter project name');
      return;
    }

    setLoading(true);

    try {
      const result = await api.createProject(
        selectedFMS,
        projectName,
        projectStartDate,
        user!.username
      );

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to create project');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingFMS) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          Start New Project
        </h1>

        {fmsList.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-slate-600 mb-4 text-sm sm:text-base">No FMS templates available</p>
            <button
              onClick={() => navigate('/create-fms')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base"
            >
              Create FMS Template
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select FMS Template
              </label>
              <select
                value={selectedFMS}
                onChange={(e) => setSelectedFMS(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                required
              >
                <option value="">Choose an FMS template...</option>
                {fmsList.map((fms) => (
                  <option key={fms.fmsId} value={fms.fmsId}>
                    {fms.fmsName} ({fms.stepCount} steps)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Start Date
              </label>
              <input
                type="date"
                value={projectStartDate}
                onChange={(e) => setProjectStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {selectedFMS && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Note:</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  The first step will be created immediately and assigned to the responsible person.
                  Subsequent steps will appear on their assigned person's dashboard only after the
                  previous step is completed.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Creating Project...' : 'Start Project'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
