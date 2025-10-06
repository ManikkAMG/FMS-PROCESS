import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Workflow, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [configError, setConfigError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
    if (!apiUrl || apiUrl === 'undefined') {
      setConfigError('API URL not configured. Please check your .env file.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await api.login(username, password);

      if (result.success) {
        setSuccess(true);
        login(username);
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Connection error. Please check your API configuration.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-slate-900 p-3 sm:p-4 rounded-xl">
              <Workflow className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-2">
            Flow Management System
          </h1>
          <p className="text-center text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Sign in to manage your workflows
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none text-sm sm:text-base"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            {configError && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{configError}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2 animate-shake">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!configError}
              className="w-full bg-slate-900 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
            <p className="text-xs sm:text-sm text-slate-600 text-center">
              <strong>Default Password:</strong> fms2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
