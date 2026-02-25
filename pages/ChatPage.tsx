import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientLayout } from '../components/ClientLayout';
import { EditorLayout } from '../components/EditorLayout';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { supabase } from '../lib/supabase';
import { getDisplayName } from '../utils/userUtils';
import { Send, User, Clock, Search, MessageSquare, Paperclip, FileText, Image as ImageIcon, Download, Loader2, X } from 'lucide-react';

interface Conversation {
  id: string;
  client_id: string;
  editor_id: string;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    profile_photo?: string;
  };
  last_message?: {
    text: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: 'client' | 'editor';
  message: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { markAsRead } = useChat();
  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('chat_id') || searchParams.get('conversation_id');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isClient = user?.role === 'client';

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel(`messages:${activeConversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeConversationId}`
        }, payload => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new as Message];
          });
          markAsRead(activeConversationId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) {
      console.log('fetchConversations: No user logged in');
      return;
    }
    console.log('Fetching conversations for user:', user.id);
    setError(null);
    try {
      const { data: convs, error: fetchError } = await supabase
        .from('chats')
        .select(`
          id, client_id, editor_id, created_at, updated_at
        `)
        .or(`client_id.eq.${user.id},editor_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching chats from Supabase:', fetchError);
        if (fetchError.message?.includes('Failed to fetch')) {
            setError('Connection failed. Please check your internet or Supabase configuration.');
        } else {
            setError(fetchError.message);
        }
        throw fetchError;
      }
      
      console.log('Raw conversations fetched:', convs?.length || 0);

      // If we have an activeConversationId from URL but it's not in the list, fetch it specifically
      let allConvs = convs || [];
      if (activeConversationId && !allConvs.find(c => c.id === activeConversationId)) {
        console.log('Active conversation not in list, fetching specifically:', activeConversationId);
        const { data: specificConv } = await supabase
          .from('chats')
          .select('id, client_id, editor_id, created_at, updated_at')
          .eq('id', activeConversationId)
          .single();
        
        if (specificConv) {
          allConvs = [specificConv, ...allConvs];
        }
      }

      // Fetch other user details
      const enrichedConvs = await Promise.all(allConvs.map(async (conv) => {
        const otherUserId = user.id === conv.client_id ? conv.editor_id : conv.client_id;
        const otherUserRole = user.id === conv.client_id ? 'Editor' : 'Client';
        console.log(`Fetching profile for other user: ${otherUserId} in chat ${conv.id}`);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, full_name, profile_photo, profile_image_url, email')
          .eq('id', otherUserId)
          .single();
          
        if (profileError) {
             console.warn(`Could not fetch profile for user ${otherUserId}`, profileError);
        }

        // Fetch last message
        const { data: lastMsg, error: msgError } = await supabase
          .from('messages')
          .select('message, created_at')
          .eq('chat_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (msgError && msgError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
            console.warn(`Error fetching last message for chat ${conv.id}`, msgError);
        }

        return {
          ...conv,
          other_user: profile ? {
            id: profile.id,
            name: getDisplayName({
              name: profile.name,
              full_name: profile.full_name,
              email: profile.email // Note: profile might not have email, but getDisplayName handles it
            }, otherUserRole),
            profile_photo: profile.profile_image_url || profile.profile_photo
          } : { 
            id: otherUserId, 
            name: otherUserRole 
          },
          last_message: lastMsg ? {
            text: lastMsg.message,
            created_at: lastMsg.created_at
          } : undefined
        };
      }));

      console.log('Enriched conversations:', enrichedConvs.length);
      setConversations(enrichedConvs);
      
      if (!activeConversationId && enrichedConvs.length > 0) {
        setActiveConversationId(enrichedConvs[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      if (error.message === 'Failed to fetch') {
        alert('Network error: Could not connect to Supabase. Please check your internet connection or Supabase URL.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    console.log(`Fetching messages for chat: ${conversationId}`);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} messages`);
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      if (error.message === 'Failed to fetch') {
        alert('Network error: Could not connect to Supabase. Please check your internet connection or Supabase URL.');
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, fileData?: { url: string, name: string, type: string }) => {
    if (e) e.preventDefault();
    if (!activeConversationId || !user || (!newMessage.trim() && !fileData)) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: activeConversationId,
          sender_id: user.id,
          sender_role: user.role,
          message: messageText || (fileData ? `Sent a file: ${fileData.name}` : ''),
          file_url: fileData?.url,
          file_name: fileData?.name,
          file_type: fileData?.type
        }]);

      if (error) throw error;
      
      // Update local conversation last message
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            last_message: {
              text: messageText || (fileData ? `Sent a file: ${fileData.name}` : ''),
              created_at: new Date().toISOString()
            }
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      if (!fileData) setNewMessage(messageText); // Restore message on failure if it wasn't a file-only message
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeConversationId) return;

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    // Allowed types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image, PDF, or Word document.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${activeConversationId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      await handleSendMessage(undefined, {
        url: publicUrl,
        name: file.name,
        type: file.type
      });

    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload file: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (loading) {
      const Layout = isClient ? ClientLayout : EditorLayout;
      return (
        <Layout title="Messages" subtitle="Loading chats...">
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        </Layout>
      );
  }

  if (error) {
      const Layout = isClient ? ClientLayout : EditorLayout;
      return (
        <Layout title="Messages" subtitle="Connection Error">
            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center p-6">
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Failed to Connect</h3>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button 
                        onClick={() => fetchConversations()}
                        className="bg-gold hover:bg-gold-dark text-black px-6 py-2 rounded-xl font-bold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </Layout>
      );
  }

  const content = (
    <div className="flex h-[calc(100vh-12rem)] bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Left Sidebar: Conversations */}
      <div className="w-1/3 border-r border-white/10 flex flex-col bg-zinc-950">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white font-display mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex items-center gap-3 ${activeConversationId === conv.id ? 'bg-gold/10 border-l-2 border-l-gold' : 'hover:bg-white/5'}`}
              >
                <div className="relative">
                  {conv.other_user?.profile_photo ? (
                    <img src={conv.other_user.profile_photo} alt={conv.other_user.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-gold font-bold">
                      {conv.other_user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-bold text-white truncate">{conv.other_user?.name || 'Unknown User'}</h3>
                    {conv.last_message && (
                      <span className="text-[10px] text-slate-500">{formatTime(conv.last_message.created_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {conv.last_message?.text || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Messages */}
      <div className="flex-1 flex flex-col bg-zinc-900/50">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-zinc-950 flex items-center gap-3">
              {activeConversation.other_user?.profile_photo ? (
                <img src={activeConversation.other_user.profile_photo} alt={activeConversation.other_user.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-gold font-bold">
                  {activeConversation.other_user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div>
                <h3 className="text-white font-bold">{activeConversation.other_user?.name || 'Unknown User'}</h3>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span> Online
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                  
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8">
                        {showAvatar && !isMe && (
                          activeConversation.other_user?.profile_photo ? (
                            <img src={activeConversation.other_user.profile_photo} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-gold font-bold">
                              {activeConversation.other_user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {showAvatar && (
                          <span className="text-[10px] text-slate-500 mb-1 px-1">
                            {isMe ? user?.name : activeConversation.other_user?.name}
                          </span>
                        )}
                        <div 
                          className={`px-4 py-2.5 rounded-2xl ${
                            isMe 
                              ? 'bg-gold text-black rounded-tr-sm' 
                              : 'bg-zinc-800 text-white rounded-tl-sm border border-white/5'
                          }`}
                        >
                          {msg.file_url && (
                            <div className="mb-2">
                              {msg.file_type?.startsWith('image/') ? (
                                <div className="relative group">
                                  <img 
                                    src={msg.file_url} 
                                    alt={msg.file_name} 
                                    className="max-w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(msg.file_url, '_blank')}
                                  />
                                  <a 
                                    href={msg.file_url} 
                                    download={msg.file_name}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-black/10 border-black/10' : 'bg-white/5 border-white/10'}`}>
                                  <div className={`p-2 rounded-lg ${isMe ? 'bg-black/20' : 'bg-white/10'}`}>
                                    {msg.file_type === 'application/pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{msg.file_name}</p>
                                    <p className="text-[10px] opacity-50 uppercase">{msg.file_type?.split('/')[1] || 'File'}</p>
                                  </div>
                                  <a 
                                    href={msg.file_url} 
                                    download={msg.file_name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-lg transition-colors ${isMe ? 'hover:bg-black/20' : 'hover:bg-white/10'}`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          {msg.message && (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-white/10">
              <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-slate-400 hover:text-gold hover:border-gold/50 transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <Paperclip className="h-5 w-5" />}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? "Uploading file..." : "Type your message..."}
                  disabled={isUploading}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !isUploading) || isUploading}
                  className="bg-gold hover:bg-gold-dark text-black rounded-xl px-6 py-3 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isClient) {
    return (
      <ClientLayout title="Messages" subtitle="Chat with your editors">
        {content}
      </ClientLayout>
    );
  }

  return (
    <EditorLayout title="Messages" subtitle="Chat with your clients">
      {content}
    </EditorLayout>
  );
};

export default ChatPage;
