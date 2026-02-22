import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { User, Star, BadgeCheck, Zap, MessageSquare, Search, Filter } from 'lucide-react';

interface EditorProfile {
    id: string;
    name: string;
    skills?: string;
    bio?: string;
    avgRating?: string;
    profile_photo?: string;
    hourly_rate?: string;
    is_featured?: boolean;
    is_active?: boolean;
}

const ClientFindEditorsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [editors, setEditors] = useState<EditorProfile[]>([]);
  const [loadingEditors, setLoadingEditors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkills, setFilterSkills] = useState('');

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
        fetchEditors();
    }
  }, [user, loading, navigate]);

  const fetchEditors = async () => {
      setLoadingEditors(true);
      
      try {
          const { data: editorsData, error } = await supabase
            .from('profiles')
            .select('id, name, skills, bio, rating, hourly_rate, is_featured, profile_photo')
            .eq('role', 'editor')
            .order('created_at', { ascending: false });
          
          if (error) {
              console.error('Supabase error fetching editors:', error);
              // Don't throw, just log
          }

          const fetchedEditors = editorsData || [];

          const editorsWithRatings = await Promise.all(fetchedEditors.map(async (editor) => {
              let avgRating = editor.rating || 0;
              
              try {
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
                  if (avgRating === 0) avgRating = 5.0;
              }

              return { ...editor, avgRating: Number(avgRating).toFixed(1) };
          }));
          
          // Sort: Featured first
          const sortedEditors = editorsWithRatings.sort((a, b) => {
              if (a.is_featured && !b.is_featured) return -1;
              if (!a.is_featured && b.is_featured) return 1;
              return 0;
          });

          setEditors(sortedEditors);
      } catch (e) {
          console.error('Error fetching editors:', e);
          setEditors([]);
      } finally {
          setLoadingEditors(false);
      }
  };

  const handleHireClick = (editor: EditorProfile) => {
      navigate(`/client/post-project?hireName=${encodeURIComponent(editor.name)}&hireId=${editor.id}`);
  };

  const filteredEditors = editors.filter(editor => {
      const matchesSearch = editor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (editor.bio && editor.bio.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSkills = filterSkills === '' || (editor.skills && editor.skills.toLowerCase().includes(filterSkills.toLowerCase()));
      return matchesSearch && matchesSkills;
  });

  if (loading || !user) return <LoadingScreen />;

  return (
    <ClientLayout title="Find Editors" subtitle="Browse our talented community of video editors.">
        
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 bg-slate-800/50 p-6 rounded-xl border border-white/5">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search by name or bio..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Filter by skills (e.g. Premiere)..." 
                        value={filterSkills}
                        onChange={(e) => setFilterSkills(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
        </div>

        {/* Editors Grid */}
        {loadingEditors ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 rounded-xl bg-surface animate-pulse border border-white/5"></div>
                ))}
            </div>
        ) : filteredEditors.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-white/10">
                <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No editors found matching your criteria.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEditors.map((editor) => (
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
                                <h3 
                                    className="font-bold text-white text-lg group-hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
                                    onClick={() => navigate(`/client/editor/${editor.id}`)}
                                >
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
                            <button 
                                onClick={() => navigate(`/client/editor/${editor.id}`)}
                                className="text-xs text-gold mt-2 hover:underline font-medium"
                            >
                                View Full Profile
                            </button>
                        </div>

                        <div className="flex gap-3 mt-auto relative z-10">
                            <Button 
                                fullWidth 
                                onClick={() => handleHireClick(editor)}
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

    </ClientLayout>
  );
};

export default ClientFindEditorsPage;
