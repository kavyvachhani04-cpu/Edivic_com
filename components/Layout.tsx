import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/find-projects') || 
                      location.pathname.includes('/my-projects') ||
                      location.pathname.includes('/completed-projects') ||
                      location.pathname.includes('/profile') ||
                      location.pathname.includes('/chat');

  // We only want the main layout for landing and simple pages
  // Dashboards have their own layouts (ClientLayout, EditorLayout)
  // But the main App.tsx wraps everything in <Layout>. 
  // Let's check if we should render the header/footer.
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');
  const isCustomLayout = isDashboard || isAuthPage;

  const getDashboardLink = () => {
      if (!user) return '/';
      if (user.role === 'admin') return '/admin/dashboard';
      if (user.role === 'client') return '/dashboard-client';
      if (user.role === 'editor') return '/dashboard-editor';
      return '/';
  };

  if (isDashboard) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-gold selection:text-black">
      {!isAuthPage && (
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
            scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl group-hover:rotate-12 transition-transform duration-500">
                <Rocket className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white uppercase">
                EDIVIC
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-10">
              <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Home</Link>
              <Link to="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Contact</Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="h-10 w-24 bg-white/5 animate-pulse rounded-full"></div>
              ) : user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 focus:outline-none group bg-white/5 hover:bg-white/10 pl-4 pr-2 py-1.5 rounded-full border border-white/10 transition-all"
                  >
                    <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
                    <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 glass rounded-3xl shadow-2xl py-3 z-50 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-white/5 mb-2">
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-white/40 truncate">{user.email}</p>
                        </div>
                        
                        <Link to={getDashboardLink()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>

                        <Link 
                          to={user.role === 'client' ? '/client/profile' : '/editor/profile'}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <div className="h-px bg-white/5 my-2"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login-client">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup-client">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.header>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[110] bg-black p-10 flex flex-col"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xl font-bold tracking-tighter uppercase">EDIVIC</span>
              <button onClick={() => setIsMenuOpen(false)}><X /></button>
            </div>
            <nav className="flex flex-col space-y-8 text-4xl font-display font-bold">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              {user ? (
                <Link to={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login-client" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/signup-client" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      {!isCustomLayout && (
        <footer className="bg-black border-t border-white/5 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg">
                    <Rocket className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-lg font-bold tracking-tighter uppercase">EDIVIC</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                  The premium marketplace connecting world-class video editors with visionary creators.
                </p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">Platform</h3>
                <ul className="space-y-4">
                  <li><Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">Home</Link></li>
                  <li><Link to="/about" className="text-white/60 hover:text-white text-sm transition-colors">About</Link></li>
                  <li><Link to="/contact" className="text-white/60 hover:text-white text-sm transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">Portals</h3>
                <ul className="space-y-4">
                  <li><Link to="/login-client" className="text-white/60 hover:text-white text-sm transition-colors">Client Portal</Link></li>
                  <li><Link to="/login-editor" className="text-white/60 hover:text-white text-sm transition-colors">Editor Portal</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">Legal</h3>
                <ul className="space-y-4">
                  <li><Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-white/20 text-xs tracking-widest uppercase">
                &copy; 2026 EDIVIC. Crafted for creators.
              </p>
              <div className="flex gap-8">
                <span className="text-white/20 text-[10px] uppercase tracking-widest">Twitter</span>
                <span className="text-white/20 text-[10px] uppercase tracking-widest">Instagram</span>
                <span className="text-white/20 text-[10px] uppercase tracking-widest">LinkedIn</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
