import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { FileVideo, Clock, CheckCircle, User, Star, BadgeCheck, Zap } from 'lucide-react';

interface EditorProfile {
    id: string;
    name: string;
    skills?: string;
    bio?: string;
}

const ClientDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  const [editors, setEditors] = useState<EditorProfile[]>([]);
  const [loadingEditors, setLoadingEditors] = useState(true);

  useEffect(() => {
    if (!loading) {
        if (!user) {
            navigate('/login-client');
            return;
        }
        if (user.role !== 'client' && user.role !== 'admin') {
            navigate(user.role === 'editor' ? '/dashboard-editor' : '/');
            return;
        }
        fetchStats();
        fetchEditors();
    }
  }, [user, loading, navigate]);

  // ... fetch functions ...
  const fetchStats = async () => {
    if (!user) return;
    try {
        const { data } = await supabase
            .from('projects')
            .select('status')
            .eq('client_id', user.id);
        
        if (data) {
            const total = data.length;
            const inProgress = data.filter(p => p.status === 'in_progress').length;
            const completed = data.filter(p => p.status === 'completed').length;
            
            setStats({ total, inProgress, completed });
        }
    } catch (e) {
        console.error('Error fetching stats:', e);
    }
  };

  const fetchEditors = async () => {
      setLoadingEditors(true);
      try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, skills, bio')
            .eq('role', 'editor')
            .limit(9); // Limit to top 9 recent editors
          
          if (error) throw error;
          setEditors(data || []);
      } catch (e) {
          console.error('Error fetching editors:', e);
      } finally {
          setLoadingEditors(false);
      }
  };

  const handleHireClick = (editorName: string) => {
      navigate(`/client/post-project?hire=${encodeURIComponent(editorName)}`);
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <ClientLayout title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Manage your video projects and find editors.">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <FileVideo className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Total Projects</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.total}</div>
                <p className="text-xs text-slate-500">All time posted projects</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">In Progress</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.inProgress}</div>
                <p className="text-xs text-slate-500">Currently being edited</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.completed}</div>
                <p className="text-xs text-slate-500">Finished & Delivered</p>
            </div>
        </div>

        {/* Featured Editors Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /> Featured Editors
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Discover top-rated talent for your next project</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/client/post-project')}>
                    Post General Project
                </Button>
            </div>

            {loadingEditors ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-slate-800/50 animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : editors.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                    <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No editor profiles found. Invite editors to join!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editors.map((editor) => (
                        <div key={editor.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-300 group flex flex-col relative overflow-hidden">
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all"></div>
                            
                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/10 text-primary-400 font-bold text-xl shadow-lg">
                                    {editor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-primary-400 transition-colors flex items-center gap-1">
                                        {editor.name}
                                        <BadgeCheck className="h-4 w-4 text-blue-400" />
                                    </h3>
                                    <div className="flex items-center text-xs text-yellow-500 mt-1">
                                        <Star className="h-3 w-3 fill-yellow-500" />
                                        <Star className="h-3 w-3 fill-yellow-500" />
                                        <Star className="h-3 w-3 fill-yellow-500" />
                                        <Star className="h-3 w-3 fill-yellow-500" />
                                        <Star className="h-3 w-3 fill-yellow-500" />
                                        <span className="text-slate-500 ml-1">(5.0)</span>
                                    </div>
                                </div>
                            </div>
                            
                            {editor.skills && (
                                <div className="mb-4 relative z-10">
                                    <div className="flex flex-wrap gap-2">
                                        {editor.skills.split(',').slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-md text-[10px] uppercase tracking-wider text-slate-300 font-medium">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-grow mb-6 relative z-10">
                                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                                    {editor.bio || "Professional video editor ready to take on your project. Experienced in various editing styles and software."}
                                </p>
                            </div>

                            <Button 
                                fullWidth 
                                onClick={() => handleHireClick(editor.name)}
                                className="relative z-10 shadow-lg shadow-primary-500/10 group-hover:shadow-primary-500/20"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Hire Now
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>

    </ClientLayout>
  );
};

export default ClientDashboard;