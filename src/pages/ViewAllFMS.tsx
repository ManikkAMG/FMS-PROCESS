import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Loader, Eye, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FMSTemplate } from '../types';

export default function ViewAllFMS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fmsList, setFmsList] = useState<FMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFMS, setExpandedFMS] = useState<string | null>(null);
  const [fmsDetails, setFmsDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    loadFMSList();
  }, []);

  const loadFMSList = async () => {
    setLoading(true);
    try {
      const result = await api.getAllFMS();
      if (result.success) {
        const userFMS = result.fmsList || [];
        setFmsList(userFMS);
      } else {
        setError(result.message || 'Failed to load FMS templates');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFMSDetails = async (fmsId: string) => {
    if (fmsDetails[fmsId]) {
      setExpandedFMS(expandedFMS === fmsId ? null : fmsId);
      return;
    }

    try {
      const result = await api.getFMSById(fmsId);
      if (result.success) {
        setFmsDetails({ ...fmsDetails, [fmsId]: result.steps });
        setExpandedFMS(fmsId);
      }
    } catch (err) {
      setError('Failed to load FMS details');
    }
  };

  const formatDuration = (step: any) => {
    if (step.whenUnit === 'days') {
      return `${step.whenDays || step.when} days`;
    } else if (step.whenUnit === 'hours') {
      return `${step.whenHours || Math.round(step.when * 24)} hours`;
    } else if (step.whenUnit === 'days+hours') {
      return `${step.whenDays || Math.floor(step.when)}d ${step.whenHours || Math.round((step.when % 1) * 24)}h`;
    }
    return `${step.when} days`;
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
            <GitBranch className="w-6 h-6 sm:w-8 sm:h-8" />
            All FMS Templates
          </h1>
          <button
            onClick={() => navigate('/create-fms')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {fmsList.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No FMS templates available</p>
            <button
              onClick={() => navigate('/create-fms')}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create First FMS Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fmsList.map((fms) => (
              <div
                key={fms.fmsId}
                className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => loadFMSDetails(fms.fmsId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {fms.fmsName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>Steps: {fms.stepCount}</span>
                        <span>Created by: {fms.createdBy}</span>
                        <span>
                          Created on:{' '}
                          {new Date(fms.createdOn).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <button className="text-slate-600 hover:text-slate-900 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedFMS === fms.fmsId && fmsDetails[fms.fmsId] && (
                  <div className="p-4 bg-white border-t border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3">Steps:</h4>
                    <div className="space-y-3">
                      {fmsDetails[fms.fmsId].map((step: any) => (
                        <div
                          key={step.stepNo}
                          className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                              {step.stepNo}
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-semibold text-slate-700">What:</span>{' '}
                                <span className="text-slate-900">{step.what}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">Who:</span>{' '}
                                <span className="text-slate-900">{step.who}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">How:</span>{' '}
                                <span className="text-slate-900">{step.how}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">When:</span>{' '}
                                <span className="text-slate-900">{formatDuration(step)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
