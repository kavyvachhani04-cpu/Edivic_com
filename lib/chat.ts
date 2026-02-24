import { supabase } from './supabase';

export const startConversation = async (clientId: string, editorId: string) => {
    console.log(`startConversation called with clientId: ${clientId}, editorId: ${editorId}`);
    try {
        if (!clientId || !editorId) {
            throw new Error('Missing client_id or editor_id');
        }

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
            console.log('Chat already exists:', existingChats[0].id);
            return existingChats[0].id;
        }

        console.log('Chat does not exist, creating new one...');

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
            console.warn('Insert failed, checking if chat exists (race condition or RLS)...', createError);
            
            // Try to fetch again, maybe it exists now or RLS prevented seeing it before?
            const { data: retryChats, error: retryError } = await supabase
                .from('chats')
                .select('id')
                .eq('client_id', clientId)
                .eq('editor_id', editorId)
                .maybeSingle();
            
            if (retryChats) {
                console.log('Found existing chat after insert failure:', retryChats.id);
                return retryChats.id;
            }

            // If it was a unique violation but we still couldn't find it, it's a permission issue
            if (createError.code === '23505') {
                 console.error('Unique violation but could not fetch chat. RLS might be blocking select.');
            }

            console.error('Error creating new chat:', createError);
            throw createError;
        }

        console.log('New chat created:', newChat.id);
        return newChat.id;
    } catch (error) {
        console.error('Failed to start chat:', error);
        throw error;
    }
};
