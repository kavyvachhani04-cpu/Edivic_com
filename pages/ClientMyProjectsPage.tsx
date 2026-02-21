import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Briefcase, Calendar, User, Clock, Trash2, XCircle } from 'lucide-react';
import { Project } from '../types';

const ClientMyProjectsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editorNames, setEditorNames] = useState<Record<string, string>>({});
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [projectToCancel, setProjectToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!loading) {
        if (!user || (user.role !== 'client' && user.role !== 'admin')) {
            navigate('/');
            return;
        }
        fetchMyProjects();
    }
  }, [user, loading, navigate]);

  const fetchMyProjects = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', user.id)
            .neq('status', 'completed') // Show pending, in_progress, and cancelled
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const fetchedProjects = data || [];
        setProjects(fetchedProjects);

        // Fetch Assigned Editor Names
        const editorIds = [...new Set(fetchedProjects.filter(p => p.editor_id).map(p => p.editor_id))];
        if (editorIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', editorIds as string[]);
            
            if (profiles) {
                const map: Record<string, string> = {};
                profiles.forEach(p => map[p.id] = p.name);
                setEditorNames(map);
            }
        }
    } catch (err) {
        console.error('Error fetching projects:', err);
    }
  };

  const handleCancelClick = (projectId: string) => {
    setProjectToCancel(projectId);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!projectToCancel) return;
    setIsCancelling(true);
    try {
        const { error } = await supabase
            .from('projects')
            .update({ status: 'cancelled' })
            .eq('id', projectToCancel);

        if (error) throw error;

        // Update local state
        setProjects(prev => prev.map(p => 
            p.id === projectToCancel ? { ...p, status: 'cancelled' } : p
        ));
        
        setIsCancelModalOpen(false);
        setProjectToCancel(null);
    } catch (error) {
        console.error('Error cancelling project:', error);
        alert('Failed to cancel project. Please try again.');
    } finally {
        setIsCancelling(false);
    }
  };

  return (
    <ClientLayout title="My Projects" subtitle="Track the status of your open jobs.">
        <div className="grid gap-6">
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-white/10">
                    <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">You have no active projects.</p>
                    <Button onClick={() => navigate('/client/post-project')}>Post a Project</Button>
                </div>
            ) : (
                projects.map(project => (
                    <div key={project.id} className={`glass p-6 rounded-xl border transition-all ${
                        project.status === 'cancelled' ? 'border-red-500/10 opacity-75' : 'border-primary-500/20 hover:border-primary-500/40'
                    }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`text-xl font-bold ${project.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-white'}`}>{project.title}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1 text-primary-400" /> {project.budget}</span>
                                    <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-primary-400" /> {project.deadline}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                project.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                                {project.status.replace('_', ' ')}
                            </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-6 line-clamp-2">{project.description}</p>
                        
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            {project.editor_id ? (
                                <div className="flex items-center text-sm text-white">
                                    <User className="h-4 w-4 mr-2 text-primary-400" />
                                    Editor: <span className="font-bold ml-1">{editorNames[project.editor_id] || 'Assigned'}</span>
                                </div>
                            ) : project.status === 'cancelled' ? (
                                <div className="flex items-center text-sm text-red-400">
                                    <XCircle className="h-4 w-4 mr-2" /> Cancelled
                                </div>
                            ) : (
                                <div className="flex items-center text-sm text-amber-500">
                                    <Clock className="h-4 w-4 mr-2" /> Waiting for editor...
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-slate-500">
                                    Posted: {new Date(project.created_at).toLocaleDateString()}
                                </div>
                                {project.status === 'pending' && !project.editor_id && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/10 h-8 px-3"
                                        onClick={() => handleCancelClick(project.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" /> Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        <ConfirmationModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={confirmCancel}
            title="Cancel Project"
            message="Are you sure you want to cancel this project? This action cannot be undone."
            confirmText="Yes, Cancel Project"
            isDestructive={true}
            isLoading={isCancelling}
        />
    </ClientLayout>
  );
};

export default ClientMyProjectsPage;