import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PlusCircle, UserCheck } from 'lucide-react';

const ClientPostProjectPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({ 
      title: '', 
      description: '', 
      budget: '', 
      deadline: '',
      reference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hireName = searchParams.get('hire');

  useEffect(() => {
    if (!loading) {
        if (!user || (user.role !== 'client' && user.role !== 'admin')) {
            navigate('/');
        }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
      if (hireName) {
          setFormData(prev => ({
              ...prev,
              description: `Hi ${hireName},\n\nI saw your profile and would like to hire you for a project.\n\nProject Details:\n`
          }));
      }
  }, [hireName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const descriptionWithRef = formData.reference 
        ? `${formData.description}\n\nReference Material: ${formData.reference}`
        : formData.description;

      const { error } = await supabase.from('projects').insert([
        {
          client_id: user.id,
          // client_name: user.name, // Removed to fix schema error
          title: formData.title, // Reverted to title
          description: descriptionWithRef, // Reverted to description
          budget: formData.budget,
          deadline: formData.deadline,
          // category: formData.category, // Removed to fix schema error
          status: 'pending' // Reverted to pending
        }
      ]);
      
      if (error) throw error;
      
      navigate('/client/my-projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(`Failed to post project: ${error.message || error.error_description || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientLayout title="Post New Project" subtitle="Create a job for editors to see.">
        <div className="max-w-3xl">
            {hireName && (
                <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
                    <div className="bg-primary-500 p-2 rounded-full text-white">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-primary-300 text-sm font-bold uppercase tracking-wide">Direct Hire</p>
                        <p className="text-white">You are creating a project offer for <span className="font-bold text-white">{hireName}</span>.</p>
                    </div>
                </div>
            )}

            <div className="glass p-8 rounded-2xl border border-white/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        label="Project Title" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        required 
                        placeholder="e.g., YouTube Vlog Editing, Corporate Promo..."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Budget ($)" 
                            value={formData.budget} 
                            onChange={e => setFormData({...formData, budget: e.target.value})} 
                            required 
                            placeholder="$100"
                        />
                        <Input 
                            label="Deadline" 
                            type="date" 
                            value={formData.deadline} 
                            onChange={e => setFormData({...formData, deadline: e.target.value})} 
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 uppercase tracking-wider text-xs">Description</label>
                        <textarea 
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:outline-none h-40"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            required
                            placeholder="Describe what you need done..."
                        ></textarea>
                    </div>

                    <Input 
                        label="Reference Link / File URL (Optional)" 
                        value={formData.reference} 
                        onChange={e => setFormData({...formData, reference: e.target.value})} 
                        placeholder="Link to raw footage or examples..."
                    />

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button type="submit" disabled={isSubmitting} size="lg">
                            {isSubmitting ? 'Posting...' : 'Post Project Now'}
                            {!isSubmitting && <PlusCircle className="ml-2 h-5 w-5" />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </ClientLayout>
  );
};

export default ClientPostProjectPage;