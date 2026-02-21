import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { RatingModal } from '../components/RatingModal';
import { CheckCircle, ExternalLink, Star } from 'lucide-react';
import { Project } from '../types';

const ClientCompletedProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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

  const handleRateClick = (project: Project) => {
    setSelectedProject(project);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number, feedback: string) => {
    if (!selectedProject) return;
    setIsSubmittingRating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ rating, feedback })
        .eq('id', selectedProject.id);

      if (error) throw error;
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id ? { ...p, rating, feedback } : p
      ));
      
      setIsRatingModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
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
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {project.title}
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-sm font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                    {project.budget}
                                </span>
                                {project.rating ? (
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                                        <Star className="h-3 w-3 fill-yellow-400" />
                                        <span>{project.rating}.0</span>
                                    </div>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleRateClick(project)}
                                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                                    >
                                        <Star className="h-3 w-3 mr-1" />
                                        Rate Editor
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {project.submission_url && (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 flex items-center justify-between mt-4">
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

        {isRatingModalOpen && (
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                isSubmitting={isSubmittingRating}
            />
        )}
    </ClientLayout>
  );
};

export default ClientCompletedProjectsPage;