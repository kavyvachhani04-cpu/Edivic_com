import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { User, Star, BadgeCheck, Zap, MessageSquare, Globe, Clock, Monitor, Wrench } from 'lucide-react';

interface EditorProfile {
    id: string;
    name: string;
    skills?: string;
    bio?: string;
    rating?: number;
    profile_photo?: string;
    hourly_rate?: string;
    portfolio_url?: string;
    primary_software?: string;
    years_experience?: string;
}

const ViewEditorProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [editor, setEditor] = useState<EditorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEditorProfile();
        }
    }, [id]);

    const fetchEditorProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setEditor(data);
        } catch (e) {
            console.error('Error fetching editor profile:', e);
            navigate('/dashboard-client');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!editor) return null;

    return (
        <ClientLayout title="Editor Profile" subtitle={`View details for ${editor.name}`}>
            <div className="max-w-4xl mx-auto">
                <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Left Side: Photo & Quick Stats */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            {editor.profile_photo ? (
                                <img src={editor.profile_photo} alt={editor.name} className="h-48 w-48 rounded-3xl object-cover border-2 border-gold/30 shadow-2xl mb-6" />
                            ) : (
                                <div className="h-48 w-48 rounded-3xl bg-white/5 flex items-center justify-center border-2 border-gold/30 text-gold font-bold text-6xl shadow-2xl mb-6">
                                    {editor.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            <div className="w-full space-y-4">
                                <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                                    <div className="flex items-center justify-center text-gold mb-1">
                                        <Star className="h-5 w-5 fill-gold" />
                                        <span className="text-xl font-bold ml-2 text-white">{Number(editor.rating || 5.0).toFixed(1)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">Average Rating</p>
                                </div>
                                
                                {editor.hourly_rate && (
                                    <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                                        <p className="text-xl font-bold text-white mb-1">{editor.hourly_rate}/hr</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest">Starting Rate</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h1 className="text-4xl font-bold text-white font-display">{editor.name}</h1>
                                <BadgeCheck className="h-8 w-8 text-blue-400" />
                            </div>
                            
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                {editor.bio || "Professional video editor with a passion for storytelling. I specialize in creating high-impact content that resonates with audiences."}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {editor.primary_software && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold">
                                            <Monitor className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Primary Software</p>
                                            <p className="font-medium">{editor.primary_software}</p>
                                        </div>
                                    </div>
                                )}
                                {editor.years_experience && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Experience</p>
                                            <p className="font-medium">{editor.years_experience}</p>
                                        </div>
                                    </div>
                                )}
                                {editor.portfolio_url && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-gold">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Portfolio</p>
                                            <a href={editor.portfolio_url} target="_blank" rel="noopener noreferrer" className="font-medium text-gold hover:underline">View Work</a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {editor.skills && (
                                <div className="mb-10">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Wrench className="h-4 w-4" /> Expertise & Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {editor.skills.split(',').map((skill, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 font-medium">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
                                <Button 
                                    size="lg" 
                                    className="bg-gold hover:bg-gold-dark text-black border-none font-bold px-8 flex-1"
                                    onClick={() => navigate(`/client/post-project?hire=${encodeURIComponent(editor.name)}`)}
                                >
                                    <Zap className="h-5 w-5 mr-2" />
                                    Hire {editor.name.split(' ')[0]}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="border-white/20 hover:border-gold hover:text-gold text-white px-8 flex-1"
                                    onClick={() => alert('Chat feature coming soon!')}
                                >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Chat with Editor
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default ViewEditorProfilePage;
