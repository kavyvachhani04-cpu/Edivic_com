import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { Button } from '../components/Button';
import { Search, DollarSign, Calendar, Filter, Briefcase, User as UserIcon, Star, MessageSquare } from 'lucide-react';
import { Project } from '../types';
import { startConversation } from '../lib/chat';

const EditorFindProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientDetails, setClientDetails] = useState<Record<string, { name: string, rating: number }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'budget_high' | 'deadline'>('newest');
  const [filterSkills, setFilterSkills] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

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
        fetchProjects();
    }
  }, [user, loading, navigate]);

  const fetchProjects = async () => {
    setIsLoadingData(true);
    try {
        const { data: projectData, error } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter projects: Show public projects (editor_id is null) OR projects assigned to me
        const fetchedProjects = (projectData || []).filter(p => !p.editor_id || p.editor_id === user.id);
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
            const clientIds = [...new Set(fetchedProjects.map(p => p.client_id))];
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, name, rating')
                .in('id', clientIds);
            
            if (profilesData) {
                const detailsMap: Record<string, { name: string, rating: number }> = {};
                profilesData.forEach(p => { detailsMap[p.id] = { name: p.name, rating: p.rating }; });
                setClientDetails(detailsMap);
            }
        }
    } catch (err) {
        console.error('Error fetching projects:', err);
    } finally {
        setIsLoadingData(false);
    }
  };

  const handleAcceptProject = async (id: string) => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('projects')
            .update({ editor_id: user.id, status: 'assigned' }) // 'assigned' instead of 'in_progress'
            .eq('id', id);
        
        if (error) throw error;
        navigate('/editor/my-projects');
    } catch(e) { console.error(e); }
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

  // Filter Logic
  const filteredProjects = projects
    .filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkills = filterSkills === '' || (p.skills && p.skills.toLowerCase().includes(filterSkills.toLowerCase()));
        
        return matchesSearch && matchesSkills;
    })
    .sort((a, b) => {
        if (sortOption === 'budget_high') {
            const budgetA = parseFloat(a.budget.replace(/[^0-9.]/g, '')) || 0;
            const budgetB = parseFloat(b.budget.replace(/[^0-9.]/g, '')) || 0;
            return budgetB - budgetA;
        } else if (sortOption === 'deadline') {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
    });

  if (loading || !user) return null;

  return (
    <EditorLayout title="Find Projects" subtitle="Discover new opportunities.">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 bg-slate-800/50 p-6 rounded-xl border border-white/5">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="budget_high">Highest Budget</option>
                        <option value="deadline">Urgent Deadline</option>
                    </select>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter by Skills</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Premiere, After Effects" 
                        value={filterSkills}
                        onChange={(e) => setFilterSkills(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingData ? (
                <div className="col-span-2 text-center py-20 text-slate-500">Loading available projects...</div>
            ) : filteredProjects.length === 0 ? (
               <div className="col-span-2 text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                  <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No matching projects found.</p>
               </div>
            ) : (
                filteredProjects.map(project => (
                    <div key={project.id} className="glass p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                                {clientDetails[project.client_id] && (
                                    <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-wider">
                                        <UserIcon className="h-3 w-3 mr-1" />
                                        {clientDetails[project.client_id].name}
                                        <span className="mx-2 text-slate-700">|</span>
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                        {Number(clientDetails[project.client_id].rating || 0).toFixed(1)}
                                    </div>
                                )}
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Open
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills && project.skills.split(',').slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                            {project.description}
                        </p>
                        
                        <div className="mt-auto pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center text-green-400 text-sm font-medium bg-green-500/10 px-3 py-1 rounded">
                                    <DollarSign className="h-4 w-4 mr-1" /> {project.budget}
                                </div>
                                <div className="flex items-center text-slate-400 text-sm">
                                    <Calendar className="h-4 w-4 mr-1.5" /> {project.deadline}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    fullWidth 
                                    onClick={() => handleAcceptProject(project.id)} 
                                    className="bg-purple-600 hover:bg-purple-700 border-none shadow-lg shadow-purple-900/20 flex-1"
                                >
                                    Accept Project
                                </Button>
                                <button 
                                    onClick={() => handleChatClick(project.client_id, project.id)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
                                    title="Chat with Client"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </EditorLayout>
  );
};

export default EditorFindProjectsPage;
