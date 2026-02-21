import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { LoadingScreen } from '../components/LoadingScreen';
import { Briefcase, CheckCircle, Search, Clock, ArrowUpRight } from 'lucide-react';

const EditorDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    available: 0,
    active: 0,
    completed: 0
  });

  useEffect(() => {
    if (!loading) {
        if (!user) {
            navigate('/login-editor');
            return;
        }
        if (user.role !== 'editor' && user.role !== 'admin') {
            navigate(user.role === 'client' ? '/dashboard-client' : '/');
            return;
        }
        fetchStats();
    }
  }, [user, loading, navigate]);

  const fetchStats = async () => {
    if (!user) return;
    try {
        // Fetch Available
        const { count: availableCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Fetch Active
        const { count: activeCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('editor_id', user.id)
            .eq('status', 'in_progress');

        // Fetch Completed
        const { count: completedCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('editor_id', user.id)
            .eq('status', 'completed');

        setStats({
            available: availableCount || 0,
            active: activeCount || 0,
            completed: completedCount || 0
        });

    } catch (e) {
        console.error('Error fetching stats:', e);
    }
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <EditorLayout title={`Welcome back, ${user.name.split(' ')[0]}!`} subtitle="Here is your editing career overview.">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Search className="h-24 w-24 text-white" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Search className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Available Projects</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.available}</div>
                <p className="text-xs text-slate-500">Pending client requests</p>
                <button 
                    onClick={() => navigate('/editor/find-projects')}
                    className="mt-4 text-sm text-blue-400 flex items-center hover:text-blue-300 transition-colors"
                >
                    Find Work <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase className="h-24 w-24 text-white" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Active Jobs</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.active}</div>
                <p className="text-xs text-slate-500">Currently in progress</p>
                <button 
                    onClick={() => navigate('/editor/my-projects')}
                    className="mt-4 text-sm text-purple-400 flex items-center hover:text-purple-300 transition-colors"
                >
                    View Active <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle className="h-24 w-24 text-white" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.completed}</div>
                <p className="text-xs text-slate-500">Successfully delivered</p>
                <button 
                    onClick={() => navigate('/editor/completed-projects')}
                    className="mt-4 text-sm text-green-400 flex items-center hover:text-green-300 transition-colors"
                >
                    View History <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>
        </div>

        {/* Quick Tips Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Tips for Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Always read the project description carefully before accepting. Ensure the budget and deadline work for you.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Communicate clearly with the client if provided. High quality work leads to repeat clients.
                    </p>
                </div>
            </div>
        </div>

    </EditorLayout>
  );
};

export default EditorDashboard;
