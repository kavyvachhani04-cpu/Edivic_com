
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Video, Play, Maximize2, X } from 'lucide-react';

interface DemoVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    created_at: string;
}

interface ClientDemoVideosProps {
    editorId: string;
}

export const ClientDemoVideos: React.FC<ClientDemoVideosProps> = ({ editorId }) => {
    const [videos, setVideos] = useState<DemoVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<DemoVideo | null>(null);

    useEffect(() => {
        fetchVideos();
    }, [editorId]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('demo_videos')
                .select('*')
                .eq('editor_id', editorId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error fetching demo videos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-white font-display mb-6">Demo Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>)}
                </div>
            </div>
        );
    }

    if (videos.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-white font-display mb-6 flex items-center gap-3">
                <Video className="h-6 w-6 text-gold" /> Demo Videos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                    <div 
                        key={video.id} 
                        className="group relative glass rounded-2xl border border-white/10 overflow-hidden hover:border-gold/30 transition-all cursor-pointer"
                        onClick={() => setActiveVideo(video)}
                    >
                        <div className="aspect-video bg-slate-900 relative">
                            <video 
                                src={video.video_url} 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 text-white fill-white ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                <h4 className="text-white font-bold text-sm truncate">{video.title}</h4>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{video.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Modal Overlay */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <button 
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        
                        <video 
                            src={activeVideo.video_url} 
                            className="w-full h-full"
                            autoPlay
                            controls
                        />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                            <h3 className="text-2xl font-bold text-white mb-2">{activeVideo.title}</h3>
                            <p className="text-slate-300 max-w-2xl text-sm leading-relaxed">{activeVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
