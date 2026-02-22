import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { FileVideo, Clock, CheckCircle, User, Star, BadgeCheck, Zap, MessageSquare } from 'lucide-react';

interface EditorProfile {
    id: string;
    name: string;
    skills?: string;
    bio?: string;
    avgRating?: string;
    profile_photo?: string;
    hourly_rate?: string;
    is_featured?: boolean;
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
          // Fetch editors
          const { data: editorsData, error } = await supabase
            .from('profiles')
            .select('id, name, skills, bio, profile_photo, rating, hourly_rate, is_featured')
            .eq('role', 'editor')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });
          
          if (error) throw error;

          // Fetch ratings for these editors (if we want to calculate dynamically, or rely on stored rating)
          // For now, let's use the stored rating if available, or calculate it.
          // The requirement says "rating (default 0)" in profile.
          // But we also have project ratings. Let's mix them or just use the profile one if updated.
          // Let's stick to the previous logic of calculating it for freshness, but fallback to profile rating.
          
          const editorsWithRatings = await Promise.all((editorsData || []).map(async (editor) => {
              let avgRating = editor.rating || 0;
              
              try {
                  // If we want to calculate real-time rating from projects:
                  const { data: ratings, error: ratingError } = await supabase
                      .from('projects')
                      .select('rating')
                      .eq('editor_id', editor.id)
                      .not('rating', 'is', null);
                  
                  if (!ratingError && ratings && ratings.length > 0) {
                      avgRating = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length;
                  } else if (avgRating === 0) {
                      avgRating = 5.0;
                  }
              } catch (ratingErr) {
                  console.warn('Error calculating dynamic rating, using stored value:', ratingErr);
                  if (avgRating === 0) avgRating = 5.0;
              }

              return { ...editor, avgRating: Number(avgRating).toFixed(1) };
          }));

          setEditors(editorsWithRatings);
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
            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <FileVideo className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Total Projects</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.total}</div>
                <p className="text-xs text-slate-500">All time posted projects</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">In Progress</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.inProgress}</div>
                <p className="text-xs text-slate-500">Currently being edited</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.completed}</div>
                <p className="text-xs text-slate-500">Finished & Delivered</p>
            </div>
        </div>

        {/* Featured Editors Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-display">
                        <Star className="h-6 w-6 text-gold fill-gold" /> Featured Editors
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Discover top-rated talent for your next project</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/client/post-project')} className="border-white/20 hover:border-gold hover:text-gold text-slate-300">
                    Post General Project
                </Button>
            </div>

            {loadingEditors ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-surface animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : editors.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-white/10">
                    <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No editor profiles found. Invite editors to join!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editors.map((editor) => (
                        <div key={editor.id} className={`glass p-6 rounded-2xl border transition-all duration-300 group flex flex-col relative overflow-hidden ${editor.is_featured ? 'border-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'border-white/10 hover:border-gold/50'}`}>
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all"></div>
                            
                            {editor.is_featured && (
                                <div className="absolute top-0 right-0 bg-gold text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg z-20 uppercase tracking-wider">
                                    Featured
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                {editor.profile_photo ? (
                                    <img src={editor.profile_photo} alt={editor.name} className="h-14 w-14 rounded-xl object-cover border border-white/10 shadow-lg" />
                                ) : (
                                    <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-gold font-bold text-xl shadow-lg">
                                        {editor.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-gold transition-colors flex items-center gap-1">
                                        {editor.name}
                                        <BadgeCheck className="h-4 w-4 text-blue-400" />
                                    </h3>
                                    <div className="flex items-center text-xs text-gold mt-1">
                                        <Star className="h-3 w-3 fill-gold" />
                                        <span className="text-white ml-1 font-bold">{editor.avgRating || '5.0'}</span>
                                        <span className="text-slate-500 ml-1">Rating</span>
                                    </div>
                                    {editor.hourly_rate && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            {editor.hourly_rate}/hr
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {editor.skills && (
                                <div className="mb-4 relative z-10">
                                    <div className="flex flex-wrap gap-2">
                                        {editor.skills.split(',').slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase tracking-wider text-slate-300 font-medium">
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

                            <div className="flex gap-3 mt-auto relative z-10">
                                <Button 
                                    fullWidth 
                                    onClick={() => handleHireClick(editor.name)}
                                    className="bg-gold hover:bg-gold-dark text-black border-none font-bold shadow-lg shadow-gold/10 group-hover:shadow-gold/20 flex-1"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Hire Now
                                </Button>
                                <button 
                                    onClick={() => alert('Chat feature coming soon!')}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
                                    title="Chat with Editor"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    </ClientLayout>
  );
};

export default ClientDashboard;