import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDisplayName } from '../utils/userUtils';
import { ClientLayout } from '../components/ClientLayout';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { User, Star, BadgeCheck, Zap, MessageSquare, Globe, Clock, Monitor, Wrench, Play, ThumbsUp, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { startConversation } from '../lib/chat';

interface EditorProfile {
    id: string;
    name: string;
    full_name?: string;
    email?: string;
    skills?: string | string[];
    bio?: string;
    rating?: number;
    profile_photo?: string;
    profile_image_url?: string;
    hourly_rate?: string;
    price_per_hour?: number;
    portfolio_url?: string;
    primary_software?: string;
    years_experience?: string;
    is_featured?: boolean;
    is_active?: boolean;
}

const ViewEditorProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [editor, setEditor] = useState<EditorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('ViewEditorProfilePage mounted, id:', id);
        if (id) {
            fetchEditorProfile();
        } else {
            console.warn('No ID provided in URL');
            setLoading(false);
        }
    }, [id]);

    const fetchEditorProfile = async () => {
        setLoading(true);
        console.log(`Fetching profile for editor ID: ${id}`);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error('Supabase error fetching editor profile:', error);
                throw error;
            }
            
            console.log('Fetched editor profile data:', data);
            setEditor(data);
        } catch (e) {
            console.error('Unexpected error fetching editor profile:', e);
            setEditor(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = async () => {
        if (!user || !editor) {
            console.error('handleChatClick: Missing user or editor', { user, editor });
            return;
        }
        
        if (user.id === editor.id) {
            alert("You cannot chat with yourself.");
            return;
        }

        console.log(`Starting chat between client ${user.id} (role: ${user.role}) and editor ${editor.id}`);
        try {
            const chatId = await startConversation(user.id, editor.id);
            console.log('Chat started successfully, navigating to:', `/client/chat?chat_id=${chatId}`);
            navigate(`/client/chat?chat_id=${chatId}`);
        } catch (error: any) {
            console.error('Failed to start chat:', error);
            alert(`Failed to start chat: ${error.message || 'Unknown error'}`);
        }
    };

    if (loading) return <LoadingScreen />;
    
    if (!editor) {
        return (
            <ClientLayout title="Editor Not Found" subtitle="We couldn't find the editor you're looking for.">
                <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-white/10 max-w-2xl mx-auto mt-8">
                    <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                    <p className="text-slate-400 mb-6">The editor profile you are trying to view does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/client/find-editors')} className="bg-primary-600 hover:bg-primary-500 text-white">
                        Back to Find Editors
                    </Button>
                </div>
            </ClientLayout>
        );
    }

    // Placeholder Data for UI
    const portfolioItems = [
        { id: 1, title: 'Tech Review 2025', category: 'YouTube', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        { id: 2, title: 'Travel Vlog: Japan', category: 'Vlog', image: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        { id: 3, title: 'Corporate Promo', category: 'Commercial', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    ];

    const reviews = [
        { id: 1, client: 'Sarah J.', rating: 5, text: 'Absolutely amazing work! Delivered ahead of schedule and the quality was top notch.', date: '2 days ago' },
        { id: 2, client: 'Mike T.', rating: 5, text: 'Great communication and understood the vision perfectly.', date: '1 week ago' },
    ];

    const editorName = getDisplayName(editor);
    const editorPhoto = editor.profile_image_url || editor.profile_photo || '';
    const editorRate = editor.price_per_hour ? `$${editor.price_per_hour}` : (editor.hourly_rate || '$0');
    const skillsArr = Array.isArray(editor.skills) ? editor.skills : (typeof editor.skills === 'string' ? editor.skills.split(',') : []);
    const ratingValue = Number(editor.rating || 5.0).toFixed(1);

    return (
        <ClientLayout title="Editor Profile" subtitle={`View details for ${editorName}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden mb-8">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Left Side: Photo & Quick Stats */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            {editorPhoto ? (
                                <img src={editorPhoto} alt={editorName} className="h-48 w-48 rounded-3xl object-cover border-2 border-gold/30 shadow-2xl mb-6" />
                            ) : (
                                <div className="h-48 w-48 rounded-3xl bg-white/5 flex items-center justify-center border-2 border-gold/30 text-gold font-bold text-6xl shadow-2xl mb-6">
                                    {editorName.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            
                            <div className="w-full grid grid-cols-2 gap-3">
                                <div className="glass p-3 rounded-2xl border border-white/5 text-center">
                                    <div className="flex items-center justify-center text-gold mb-1">
                                        <Star className="h-4 w-4 fill-gold" />
                                        <span className="text-lg font-bold ml-1 text-white">{ratingValue}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Rating</p>
                                </div>
                                <div className="glass p-3 rounded-2xl border border-white/5 text-center">
                                    <p className="text-lg font-bold text-white mb-1">{editorRate || '$30'}/hr</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white font-display">{editorName}</h1>
                                <BadgeCheck className="h-8 w-8 text-blue-400" />
                                {editor.is_featured && (
                                    <span className="px-2 py-1 bg-gold text-black text-xs font-bold rounded uppercase">Featured</span>
                                )}
                            </div>
                            
                            {editor.email && (
                                <div className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                                    <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{editor.email}</span>
                                </div>
                            )}
                            
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                {editor.bio || "Professional video editor with a passion for storytelling. I specialize in creating high-impact content that resonates with audiences."}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-slate-800 rounded-lg text-gold">
                                        <Monitor className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Software</p>
                                        <p className="font-medium text-sm">{editor.primary_software || 'Premiere Pro'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-slate-800 rounded-lg text-gold">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Experience</p>
                                        <p className="font-medium text-sm">{editor.years_experience || '3+ Years'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-slate-800 rounded-lg text-gold">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Projects</p>
                                        <p className="font-medium text-sm">12 Completed</p>
                                    </div>
                                </div>
                            </div>

                            {skillsArr.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Wrench className="h-3 w-3" /> Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsArr.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium hover:bg-white/10 transition-colors cursor-default">
                                                {String(skill).trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                                <Button 
                                    size="lg" 
                                    className="bg-gold hover:bg-gold-dark text-black border-none font-bold px-8 flex-1 shadow-lg shadow-gold/10"
                                    onClick={() => navigate(`/client/post-project?hireName=${encodeURIComponent(editorName)}&hireId=${editor.id}`)}
                                >
                                    <Zap className="h-5 w-5 mr-2" />
                                    Hire {editorName.split(' ')[0] || 'Editor'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="border-white/20 hover:border-gold hover:text-gold text-white px-8 flex-1"
                                    onClick={handleChatClick}
                                >
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white font-display">Featured Work</h2>
                        {editor.portfolio_url && (
                            <a href={editor.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline flex items-center gap-1">
                                <Globe className="h-4 w-4" /> View Full Portfolio
                            </a>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {portfolioItems.map((item) => (
                            <div key={item.id} className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/10 cursor-pointer">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                        <Play className="h-5 w-5 text-white fill-white ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-xs text-gold font-bold uppercase tracking-wider mb-1">{item.category}</p>
                                    <h3 className="text-white font-bold">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white font-display mb-6">Client Reviews</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="glass p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                            {review.client.charAt(0)}
                                        </div>
                                        <span className="font-bold text-white text-sm">{review.client}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-slate-700'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm italic mb-3">"{review.text}"</p>
                                <p className="text-xs text-slate-600">{review.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default ViewEditorProfilePage;
