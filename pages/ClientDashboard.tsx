import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { FileVideo, Clock, CheckCircle, User, Star, BadgeCheck, Zap, MessageSquare } from 'lucide-react';

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

const ClientDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });

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
        fetchStats();
    }
  }, [user, loading, navigate]);

  const fetchStats = async () => {
    if (!user) return;
    try {
        const { data } = await supabase
            .from('projects')
            .select('status')
            .eq('client_id', user.id);
        
        if (data) {
            const total = data.length;
            const inProgress = data.filter(p => p.status === 'in_progress').length;
            const completed = data.filter(p => p.status === 'completed').length;
            
            setStats({ total, inProgress, completed });
        }
    } catch (e) {
        console.error('Error fetching stats:', e);
    }
  };

  if (loading || !user) return <LoadingScreen />;

  return (
    <ClientLayout title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Manage your video projects and find editors.">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <FileVideo className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Total Projects</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.total}</div>
                <p className="text-xs text-slate-500">All time posted projects</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">In Progress</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.inProgress}</div>
                <p className="text-xs text-slate-500">Currently being edited</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-gold">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 font-display">{stats.completed}</div>
                <p className="text-xs text-slate-500">Finished & Delivered</p>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-gold/10 rounded-full flex items-center justify-center mb-4 text-gold">
                    <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Need an Editor?</h3>
                <p className="text-slate-400 mb-6 max-w-sm">Post a new project or browse our talented community of editors to find the perfect match.</p>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/client/post-project')}>Post Project</Button>
                    <Button variant="outline" onClick={() => navigate('/client/find-editors')}>Find Editors</Button>
                </div>
            </div>
            
            <div className="glass p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                    <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Messages</h3>
                <p className="text-slate-400 mb-6 max-w-sm">Chat with editors, discuss project details, and share files securely.</p>
                <Button variant="outline" onClick={() => alert('Chat feature coming soon!')}>Go to Inbox</Button>
            </div>
        </div>

    </ClientLayout>
  );
};

export default ClientDashboard;