import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { Button } from '../components/Button';
import { Briefcase, Calendar, DollarSign, Send } from 'lucide-react';
import { Project } from '../types';

const EditorMyProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
        if (!user) {
            navigate('/login-editor');
            return;
        }
        if (user.role !== 'editor' && user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchMyProjects();
    }
  }, [user, loading, navigate]);

  const fetchMyProjects = async () => {
    if (!user) return;
    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('editor_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false });
    setProjects(data || []);
  };

  const handleSubmitWork = async (id: string) => {
    const url = submissionUrls[id];
    if (!url) return;
    
    setLoadingId(id);
    try {
        const { error } = await supabase
            .from('projects')
            .update({ submission_url: url, status: 'completed' })
            .eq('id', id);

        if (error) throw error;
        
        // Remove from list locally
        setProjects(prev => prev.filter(p => p.id !== id));
        // Optional: Navigate to completed or show toast
    } catch(e) { 
        console.error(e); 
    } finally {
        setLoadingId(null);
    }
  };

  return (
    <EditorLayout title="My Projects" subtitle="Manage your active jobs.">
        <div className="grid gap-6">
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                    <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">You have no active projects.</p>
                    <Button onClick={() => navigate('/editor/find-projects')}>Find Projects</Button>
                </div>
            ) : (
                projects.map(project => (
                    <div key={project.id} className="glass p-6 rounded-xl border border-purple-500/20 relative">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                    <span className="flex items-center text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
                                        <DollarSign className="h-3 w-3 mr-1" /> {project.budget}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" /> Deadline: {project.deadline}
                                    </span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 self-start">
                                In Progress
                            </span>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 mb-6">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                Project Completion
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Paste your Google Drive / Dropbox link here..." 
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none placeholder-slate-600"
                                    value={submissionUrls[project.id] || ''}
                                    onChange={(e) => setSubmissionUrls(prev => ({ ...prev, [project.id]: e.target.value }))}
                                />
                                <Button 
                                    onClick={() => handleSubmitWork(project.id)}
                                    disabled={!submissionUrls[project.id] || loadingId === project.id}
                                    className="bg-green-600 hover:bg-green-700 border-none whitespace-nowrap"
                                >
                                    {loadingId === project.id ? 'Submitting...' : 'Mark as Completed'}
                                    <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                * Ensure the link is accessible. Once marked completed, the client will be notified.
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </EditorLayout>
  );
};

export default EditorMyProjectsPage;
