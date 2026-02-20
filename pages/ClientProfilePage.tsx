import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Save, User } from 'lucide-react';

const ClientProfilePage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (!loading) {
        if (!user || user.role !== 'client') {
             // Admin can also view but strictly this is client view
             if (user?.role !== 'admin') navigate('/login-client');
        }
        if (user) setName(user.name);
    }
  }, [user, loading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
        const { error: authError } = await supabase.auth.updateUser({
            data: { name: name }
        });
        if (authError) throw authError;

        const { error: dbError } = await supabase
            .from('profiles')
            .update({ name: name })
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
    <ClientLayout title="Profile Settings" subtitle="Manage your account details.">
        <div className="max-w-2xl">
            <div className="glass p-8 rounded-2xl border border-white/5">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-primary-500 shadow-lg shadow-primary-900/30">
                        <User className="h-10 w-10 text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                            Client
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <Input 
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        <p className="text-xs text-slate-500 mt-2">Email address cannot be changed.</p>
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
    </ClientLayout>
  );
};

export default ClientProfilePage;