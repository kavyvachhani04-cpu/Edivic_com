import { supabase } from './supabase';

export const startConversation = async (clientId: string, editorId: string) => {
    try {
        // 1. Check if chat already exists
        const { data: existingChats, error: fetchError } = await supabase
            .from('chats')
            .select('id')
            .eq('client_id', clientId)
            .eq('editor_id', editorId);

        if (fetchError) {
            console.error('Error checking existing chat:', fetchError);
            throw fetchError;
        }

        if (existingChats && existingChats.length > 0) {
            // Chat exists, return its ID
            return existingChats[0].id;
        }

        // 2. If not, create a new chat
        const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert([{
                client_id: clientId,
                editor_id: editorId,
            }])
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating new chat:', createError);
            throw createError;
        }

        return newChat.id;
    } catch (error) {
        console.error('Failed to start chat:', error);
        throw error;
    }
};
