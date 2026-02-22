import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Briefcase, 
  CheckCircle, 
  User, 
  LogOut, 
  Menu, 
  Bell,
  Rocket,
  Settings,
  Search
} from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Overview', path: '/dashboard-client' },
    { icon: <Search className="h-5 w-5" />, label: 'Find Editors', path: '/client/find-editors' },
    { icon: <PlusCircle className="h-5 w-5" />, label: 'Post Project', path: '/client/post-project' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'My Projects', path: '/client/my-projects' },
    { icon: <CheckCircle className="h-5 w-5" />, label: 'Completed', path: '/client/completed-projects' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/client/profile' },
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
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200">
              Client Portal
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
                    ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-primary-400 truncate">Client Account</p>
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
        {/* Top Mobile Header */}
        <header className="lg:hidden h-16 bg-surface border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-30 glass">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-white">EDIVIC</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
           {/* Background Glows (Cyan for Client) */}
           <div className="absolute top-0 left-0 w-full h-96 bg-primary-900/10 blur-[100px] pointer-events-none" />
           
           <div className="relative z-10 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                  {subtitle && <p className="text-slate-400">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:border-primary-500/50 transition-all">
                        <Bell className="h-5 w-5" />
                    </button>
                    <div className="hidden md:block h-8 w-px bg-white/10" />
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 focus:outline-none group"
                      >
                         <div className="text-right hidden md:block">
                           <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">{user?.name}</p>
                           <p className="text-xs text-slate-400">Client</p>
                         </div>
                         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-primary-500/30 transition-all border border-white/10">
                           {user?.name.charAt(0).toUpperCase()}
                         </div>
                      </button>

                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                           <div className="px-4 py-3 border-b border-white/10 mb-2">
                             <p className="text-sm font-bold text-white">{user?.name}</p>
                             <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                           </div>

                           <Link 
                             to="/client/profile"
                             className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-primary-400"
                             onClick={() => setIsProfileOpen(false)}
                           >
                             <div className="flex items-center gap-2">
                               <Settings className="h-4 w-4" />
                               <span>Profile Settings</span>
                             </div>
                           </Link>
                           
                           <div className="border-t border-white/10 my-2"></div>
                           
                           <button
                             onClick={handleLogout}
                             className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-red-400 transition-colors"
                           >
                              <div className="flex items-center gap-2">
                               <LogOut className="h-4 w-4" />
                               <span>Sign Out</span>
                             </div>
                           </button>
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {children}
           </div>
        </main>
      </div>
    </div>
  );
};