import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { CheckCircle, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { Project } from '../types';

const EditorCompletedProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

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
        fetchCompletedProjects();
    }
  }, [user, loading, navigate]);

  const fetchCompletedProjects = async () => {
    if (!user) return;
    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('editor_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
    setProjects(data || []);
  };

  return (
    <EditorLayout title="Completed Projects" subtitle="Your history of delivered work.">
        <div className="grid gap-6">
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                    <CheckCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No completed projects yet.</p>
                </div>
            ) : (
                projects.map(project => (
                    <div key={project.id} className="glass p-6 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all opacity-80 hover:opacity-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {project.title}
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">ID: {project.id}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-green-400 font-mono font-bold">{project.budget}</span>
                                <span className="text-xs text-slate-500">Earned</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4 bg-slate-900/30 p-3 rounded-lg">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 opacity-50" />
                                Completed: {new Date(project.deadline).toLocaleDateString()} 
                                {/* Note: Ideally we'd store a completed_at timestamp, using deadline as proxy for now or simple display */}
                            </div>
                             <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 opacity-50" />
                                Fixed Price
                            </div>
                        </div>

                        {project.submission_url && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Submission Link</p>
                                <a 
                                    href={project.submission_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center truncate"
                                >
                                    {project.submission_url}
                                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                </a>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </EditorLayout>
  );
};

export default EditorCompletedProjectsPage;
