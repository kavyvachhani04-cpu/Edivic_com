import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { CheckCircle, ExternalLink, Download } from 'lucide-react';
import { Project } from '../types';

const ClientCompletedProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!loading) {
        if (!user || (user.role !== 'client' && user.role !== 'admin')) {
            navigate('/');
            return;
        }
        fetchCompleted();
    }
  }, [user, loading, navigate]);

  const fetchCompleted = async () => {
    if (!user) return;
    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
    setProjects(data || []);
  };

  return (
    <ClientLayout title="Completed Projects" subtitle="Archive of your finished videos.">
        <div className="grid gap-6">
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                    <CheckCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No completed projects yet.</p>
                </div>
            ) : (
                projects.map(project => (
                    <div key={project.id} className="glass p-6 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {project.title}
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </h3>
                            <span className="text-sm font-mono text-green-400">{project.budget}</span>
                        </div>
                        
                        <p className="text-slate-400 text-sm mb-6">{project.description}</p>
                        
                        {project.submission_url && (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 flex items-center justify-between">
                                <div className="overflow-hidden mr-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Final Submission</p>
                                    <a href={project.submission_url} target="_blank" rel="noreferrer" className="text-primary-400 text-sm truncate block hover:underline">
                                        {project.submission_url}
                                    </a>
                                </div>
                                <a 
                                    href={project.submission_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2 bg-slate-800 rounded-lg hover:bg-primary-600 hover:text-white transition-colors text-slate-400"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </ClientLayout>
  );
};

export default ClientCompletedProjectsPage;