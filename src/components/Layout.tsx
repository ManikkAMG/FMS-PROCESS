import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Workflow, LayoutDashboard, GitBranch, PlayCircle, FileText, List, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create-fms', label: 'Create FMS', icon: GitBranch },
    { path: '/view-fms', label: 'View FMS', icon: List },
    { path: '/start-project', label: 'Start Project', icon: PlayCircle },
    { path: '/logs', label: 'Logs', icon: FileText },
    { path: '/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-0 sm:h-16 gap-2 sm:gap-0">
            <div className="flex items-center justify-between sm:gap-4 lg:gap-8">
              <div className="flex items-center gap-2">
                <Workflow className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">FMS</h1>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1 min-w-max sm:min-w-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-xs sm:text-sm">
                <span className="text-slate-600 hidden sm:inline">Logged in as </span>
                <span className="font-semibold text-slate-900">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-3 sm:py-6">{children}</main>
    </div>
  );
}
