import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, ChevronRight, LayoutDashboard, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Paths where we want a full screen or custom layout (Dashboards)
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/find-projects');

  if (isDashboard) {
    return <>{children}</>;
  }

  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');

  const getDashboardLink = () => {
      if (!user) return '/';
      if (user.role === 'admin') return '/admin/dashboard';
      if (user.role === 'client') return '/dashboard-client';
      if (user.role === 'editor') return '/dashboard-editor';
      return '/'; // Fallback
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100">
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-2 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                EDIVIC
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {!user && (
                <>
                  <Link to="/" className="text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors">Home</Link>
                  <Link to="/about" className="text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors">About Us</Link>
                  <Link to="/contact" className="text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors">Contact</Link>
                </>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="h-10 w-24 bg-slate-800 animate-pulse rounded"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                   <div className="text-right hidden lg:block">
                     <p className="text-sm font-medium text-white">{user.name}</p>
                     <p className="text-xs text-primary-400 uppercase tracking-wider">{user.role}</p>
                   </div>
                   <Link to={getDashboardLink()}>
                    <Button variant="primary" size="sm">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-3 mr-4 border-r border-slate-700 pr-4">
                     <Link to="/login-editor" className="text-sm font-medium text-slate-400 hover:text-white">Editor Login</Link>
                     <Link to="/login-client" className="text-sm font-medium text-slate-400 hover:text-white">Client Login</Link>
                  </div>
                  <Link to="/signup-client">
                    <Button variant="outline" size="sm">Hire Editors</Button>
                  </Link>
                  <Link to="/signup-editor">
                    <Button variant="primary" size="sm">Find Work</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400 hover:text-white focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-white/10 glass absolute w-full">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-white py-2">Home</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-white py-2">About Us</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-white py-2">Contact</Link>
              
              <div className="border-t border-white/10 my-2 pt-2">
                {user ? (
                   <Link to={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                      <Button fullWidth>Go to Dashboard</Button>
                   </Link>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">For Clients</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                       <Link to="/login-client" onClick={() => setIsMenuOpen(false)}>
                          <Button fullWidth variant="secondary" size="sm">Log in</Button>
                       </Link>
                       <Link to="/signup-client" onClick={() => setIsMenuOpen(false)}>
                          <Button fullWidth variant="outline" size="sm">Sign up</Button>
                       </Link>
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">For Editors</p>
                    <div className="grid grid-cols-2 gap-2">
                       <Link to="/login-editor" onClick={() => setIsMenuOpen(false)}>
                          <Button fullWidth variant="secondary" size="sm">Log in</Button>
                       </Link>
                       <Link to="/signup-editor" onClick={() => setIsMenuOpen(false)}>
                          <Button fullWidth variant="primary" size="sm">Join Now</Button>
                       </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow relative">
        {children}
      </main>

      {!isAuthPage && (
        <footer className="bg-slate-900 border-t border-white/10 py-12 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                         <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-primary-600 p-1 rounded-md">
                                <Rocket className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">EDIVIC</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                           The future marketplace for video editing professionals and clients.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Portals</h3>
                        <ul className="space-y-2">
                            <li><Link to="/login-client" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Client Login</Link></li>
                            <li><Link to="/login-editor" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Editor Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-2">
                             <li><Link to="/privacy" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Privacy Policy</Link></li>
                             <li><Link to="/terms" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                    &copy; 2026 EDIVIC. All rights reserved.
                </div>
            </div>
        </footer>
      )}
    </div>
  );
};