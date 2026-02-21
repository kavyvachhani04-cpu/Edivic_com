
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  MonitorPlay, 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  CheckCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  ShieldCheck
} from 'lucide-react';

interface EditorLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Overview', path: '/dashboard-editor' },
    { icon: <Search className="h-5 w-5" />, label: 'Find Projects', path: '/editor/find-projects' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'My Projects', path: '/editor/my-projects' },
    { icon: <CheckCircle className="h-5 w-5" />, label: 'Completed', path: '/editor/completed-projects' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/editor/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-slate-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-white/5 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <MonitorPlay className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Editor Studio
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-white/5 relative overflow-hidden group">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                          {user?.subscription_status === 'active' && <ShieldCheck className="h-3 w-3 text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                          {user?.plan_name || 'Free User'}
                        </p>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg text-sm"
            >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 bg-surface border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-30 glass">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-white">EDIVIC</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
           <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/10 blur-[100px] pointer-events-none" />
           
           <div className="relative z-10 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                    {user?.subscription_status === 'active' && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest rounded">
                        Active {user.plan_name}
                      </span>
                    )}
                  </div>
                  {subtitle && <p className="text-slate-400">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all">
                        <Bell className="h-5 w-5" />
                    </button>
                    <div className="hidden md:block h-8 w-px bg-white/10" />
                    <span className="hidden md:inline text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {children}
           </div>
        </main>
      </div>
    </div>
  );
};
