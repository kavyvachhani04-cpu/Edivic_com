import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface ChatContextType {
  unreadCount: number;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  unreadCount: 0,
  markAsRead: async () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    // Subscribe to new messages where the user is NOT the sender
    const subscription = supabase
      .channel('global-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new;
        
        // Check if the message belongs to a conversation the user is part of
        // and the user is NOT the sender
        if (newMessage.sender_id !== user.id) {
          const { data: conv } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', newMessage.conversation_id)
            .or(`client_id.eq.${user.id},editor_id.eq.${user.id}`)
            .single();

          if (conv) {
            setUnreadCount(prev => prev + 1);
            showNotification(newMessage.message_text);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      // Get all conversation IDs for the user
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`client_id.eq.${user.id},editor_id.eq.${user.id}`);

      if (!convs || convs.length === 0) return;

      const convIds = convs.map(c => c.id);

      // Count unread messages in those conversations where sender is not the user
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Re-fetch unread count to ensure accuracy
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const showNotification = (messageText: string) => {
    // Play sound
    try {
      const audio = new Audio('/notification.mp3'); // Assuming a sound file exists
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      // Ignore audio errors
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: messageText,
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('New Message', {
            body: messageText,
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  return (
    <ChatContext.Provider value={{ unreadCount, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
};
