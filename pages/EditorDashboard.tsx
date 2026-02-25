import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { LoadingScreen } from '../components/LoadingScreen';
import { Button } from '../components/Button';
import { Briefcase, CheckCircle, Search, Clock, ArrowUpRight, MessageSquare, Star, User as UserIcon } from 'lucide-react';
import { startConversation } from '../lib/chat';

const EditorDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    available: 0,
    active: 0,
    completed: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

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
        fetchRecentProjects();
    }
  }, [user, loading, navigate]);

  const fetchRecentProjects = async () => {
      setIsLoadingProjects(true);
      try {
          const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(3);
          
          setRecentProjects(data || []);
      } catch (e) {
          console.error('Error fetching recent projects:', e);
      } finally {
          setIsLoadingProjects(false);
      }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
        // Fetch Available
        const { count: availableCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');

        // Fetch Active (Pending or Submitted)
        const { count: activeCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('editor_id', user.id)
            .in('status', ['pending', 'submitted']);

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

  const handleChatClick = async (clientId: string, projectId: string) => {
      if (!user) return;
      try {
          const chatId = await startConversation(clientId, user.id);
          navigate(`/editor/chat?chat_id=${chatId}`);
      } catch (error) {
          console.error('Failed to start chat:', error);
          alert('Failed to start chat. Please try again.');
      }
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <EditorLayout title={`Welcome back, ${user.name.split(' ')[0]}!`} subtitle="Here is your editing career overview.">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Search className="h-24 w-24 text-gold" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <Search className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Available Projects</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.available}</div>
                <p className="text-xs text-slate-500">Pending client requests</p>
                <button 
                    onClick={() => navigate('/editor/find-projects')}
                    className="mt-4 text-sm text-gold flex items-center hover:text-white transition-colors"
                >
                    Find Work <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase className="h-24 w-24 text-gold" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Active Jobs</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.active}</div>
                <p className="text-xs text-slate-500">Currently in progress</p>
                <button 
                    onClick={() => navigate('/editor/my-projects')}
                    className="mt-4 text-sm text-gold flex items-center hover:text-white transition-colors"
                >
                    View Active <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle className="h-24 w-24 text-gold" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.completed}</div>
                <p className="text-xs text-slate-500">Successfully delivered</p>
                <button 
                    onClick={() => navigate('/editor/completed-projects')}
                    className="mt-4 text-sm text-gold flex items-center hover:text-white transition-colors"
                >
                    View History <ArrowUpRight className="h-3 w-3 ml-1" />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Recent Projects */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white font-display">Recent Available Projects</h3>
                    <button 
                        onClick={() => navigate('/editor/find-projects')}
                        className="text-sm text-gold hover:underline"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-4">
                    {isLoadingProjects ? (
                        [1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>)
                    ) : recentProjects.length === 0 ? (
                        <div className="p-10 text-center glass rounded-2xl border border-dashed border-white/10">
                            <p className="text-slate-500">No projects available at the moment.</p>
                        </div>
                    ) : (
                        recentProjects.map(project => (
                            <div key={project.id} className="glass p-5 rounded-2xl border border-white/10 hover:border-gold/30 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-gold transition-colors">{project.title}</h4>
                                        <div className="flex items-center text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                                            <UserIcon className="h-3 w-3 mr-1" />
                                            {project.client_name || 'Client'}
                                        </div>
                                    </div>
                                    <div className="text-gold font-bold text-sm">{project.budget}</div>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{project.description}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-[10px] text-slate-500">
                                        <Clock className="h-3 w-3 mr-1" /> {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleChatClick(project.client_id, project.id)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex items-center text-xs font-bold"
                                            title="Chat with Client"
                                        >
                                            <MessageSquare className="h-3 w-3 mr-1.5" />
                                            Chat
                                        </button>
                                        <Button 
                                            size="sm" 
                                            className="bg-gold hover:bg-gold-dark text-black border-none font-bold text-xs"
                                            onClick={() => navigate('/editor/find-projects')}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Tips Section */}
            <div className="bg-surface rounded-2xl p-6 border border-white/10 h-fit">
                <h3 className="text-lg font-bold text-white mb-6 font-display">Tips for Success</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold flex-shrink-0 border border-white/10 text-xs">1</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Always read the project description carefully before accepting. Ensure the budget and deadline work for you.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold flex-shrink-0 border border-white/10 text-xs">2</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Communicate clearly with the client if provided. High quality work leads to repeat clients.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    </EditorLayout>
  );
};

export default EditorDashboard;
