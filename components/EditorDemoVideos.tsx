
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { Input } from './Input';
import { Video, Plus, Trash2, Play, Loader2, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface DemoVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    created_at: string;
}

interface EditorDemoVideosProps {
    editorId: string;
}

export const EditorDemoVideos: React.FC<EditorDemoVideosProps> = ({ editorId }) => {
    const [videos, setVideos] = useState<DemoVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: '', description: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload MP4, MOV, or WebM.');
            return;
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 50MB.');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !newVideo.title) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${editorId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('demo-videos')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('demo-videos')
                .getPublicUrl(filePath);

            // Save to Database
            const { error: dbError } = await supabase
                .from('demo_videos')
                .insert([{
                    editor_id: editorId,
                    title: newVideo.title,
                    description: newVideo.description,
                    video_url: publicUrl
                }]);

            if (dbError) throw dbError;

            // Reset Form
            setNewVideo({ title: '', description: '' });
            setSelectedFile(null);
            setPreviewUrl(null);
            setShowUploadForm(false);
            fetchVideos();
            alert('Video uploaded successfully!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id: string, videoUrl: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            // Extract file path from URL
            // URL format: .../storage/v1/object/public/demo-videos/editor_id/filename.ext
            const urlParts = videoUrl.split('demo-videos/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1];
                await supabase.storage.from('demo-videos').remove([filePath]);
            }

            const { error } = await supabase
                .from('demo_videos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVideos(videos.filter(v => v.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete video.');
        }
    };

    return (
        <div className="mt-10 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Video className="h-5 w-5 text-gold" /> Demo Videos
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Showcase your best work to potential clients.</p>
                </div>
                {!showUploadForm && (
                    <Button 
                        onClick={() => setShowUploadForm(true)} 
                        size="sm" 
                        className="bg-gold hover:bg-gold-dark text-black font-bold"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Video
                    </Button>
                )}
            </div>

            {showUploadForm && (
                <div className="glass p-6 rounded-2xl border border-gold/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white">Upload New Demo</h4>
                        <button onClick={() => { setShowUploadForm(false); setPreviewUrl(null); setSelectedFile(null); }} className="text-slate-500 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <Input 
                                    label="Video Title" 
                                    value={newVideo.title} 
                                    onChange={e => setNewVideo({...newVideo, title: e.target.value})} 
                                    required 
                                    placeholder="e.g. Cinematic Travel Reel"
                                />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-gold focus:outline-none text-sm min-h-[100px]"
                                        value={newVideo.description}
                                        onChange={e => setNewVideo({...newVideo, description: e.target.value})}
                                        placeholder="Briefly describe the editing techniques used..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Video File (Max 50MB)</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${previewUrl ? 'border-gold/50 bg-gold/5' : 'border-white/10 hover:border-gold/30 hover:bg-white/5'}`}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full flex flex-col items-center">
                                            <video src={previewUrl} className="max-h-32 rounded-lg mb-2" controls />
                                            <p className="text-[10px] text-gold font-bold truncate max-w-full">{selectedFile?.name}</p>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-slate-600 mb-2" />
                                            <p className="text-xs text-slate-400">Click to select MP4 or MOV</p>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        accept="video/mp4,video/quicktime,video/webm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowUploadForm(false)}
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={uploading || !selectedFile || !newVideo.title}
                                className="bg-gold hover:bg-gold-dark text-black font-bold min-w-[120px]"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Save Video
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>)}
                </div>
            ) : videos.length === 0 ? (
                <div className="p-10 text-center glass rounded-2xl border border-dashed border-white/10">
                    <Video className="h-10 w-10 text-slate-700 mx-auto mb-3 opacity-20" />
                    <p className="text-slate-500 text-sm">No demo videos uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map(video => (
                        <div key={video.id} className="glass rounded-2xl border border-white/10 overflow-hidden group hover:border-gold/30 transition-all">
                            <div className="aspect-video bg-black relative flex items-center justify-center group">
                                <video 
                                    src={video.video_url} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    controls
                                />
                                <button 
                                    onClick={() => handleDelete(video.id, video.video_url)}
                                    className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Delete Video"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-white mb-1">{video.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{video.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
