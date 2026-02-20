import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EditorLayout } from '../components/EditorLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Save, User, AlignLeft, Wrench } from 'lucide-react';

const EditorProfilePage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (!loading) {
        if (!user) {
            navigate('/login-editor');
            return;
        }
        fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
      if (!user) return;
      try {
          // Fetch additional profile fields
          const { data, error } = await supabase
            .from('profiles')
            .select('name, skills, bio')
            .eq('id', user.id)
            .single();
          
          if (data) {
              setFormData({
                  name: data.name || user.name,
                  skills: data.skills || '',
                  bio: data.bio || ''
              });
          }
      } catch (error) {
          console.error('Error fetching profile details:', error);
          // Fallback to auth name
          setFormData(prev => ({ ...prev, name: user.name }));
      }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
        // 1. Update Supabase Auth Metadata (Name only)
        const { error: authError } = await supabase.auth.updateUser({
            data: { name: formData.name }
        });
        if (authError) throw authError;

        // 2. Update Profiles Table (Name, Skills, Bio)
        const { error: dbError } = await supabase
            .from('profiles')
            .update({ 
                name: formData.name,
                skills: formData.skills,
                bio: formData.bio
            })
            .eq('id', user.id);
        
        if (dbError) throw dbError;

        await refreshUser();
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <EditorLayout title="Profile Settings" subtitle="Manage your public profile and skills.">
        <div className="max-w-3xl">
            <div className="glass p-8 rounded-2xl border border-white/5">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-purple-500 shadow-lg shadow-purple-900/30">
                        <User className="h-10 w-10 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{formData.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Video Editor
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={isSaving}
                        />
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 uppercase tracking-wider text-xs">Email Address</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled 
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider text-xs flex items-center gap-2">
                            <Wrench className="h-3 w-3" /> Skills
                        </label>
                        <input 
                            type="text"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g. Adobe Premiere, After Effects, Color Grading, Sound Design"
                            value={formData.skills}
                            onChange={(e) => setFormData({...formData, skills: e.target.value})}
                            disabled={isSaving}
                        />
                        <p className="text-xs text-slate-500">Separate skills with commas.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider text-xs flex items-center gap-2">
                            <AlignLeft className="h-3 w-3" /> Bio / About Me
                        </label>
                        <textarea 
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                            placeholder="Tell clients about your experience and editing style..."
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving Changes...' : 'Save Profile'}
                            {!isSaving && <Save className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </EditorLayout>
  );
};

export default EditorProfilePage;