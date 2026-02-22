import { supabase } from './supabase';

export const startConversation = async (clientId: string, editorId: string, projectId?: string) => {
    try {
        // 1. Check if conversation already exists
        let query = supabase
            .from('conversations')
            .select('id')
            .eq('client_id', clientId)
            .eq('editor_id', editorId);

        if (projectId) {
            query = query.eq('project_id', projectId);
        } else {
            query = query.is('project_id', null);
        }

        const { data: existingConversations, error: fetchError } = await query;

        if (fetchError) {
            console.error('Error checking existing conversation:', fetchError);
            throw fetchError;
        }

        if (existingConversations && existingConversations.length > 0) {
            // Conversation exists, return its ID
            return existingConversations[0].id;
        }

        // 2. If not, create a new conversation
        const newConversationData: any = {
            client_id: clientId,
            editor_id: editorId,
        };
        
        if (projectId) {
            newConversationData.project_id = projectId;
        }

        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert([newConversationData])
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating new conversation:', createError);
            throw createError;
        }

        return newConversation.id;
    } catch (error) {
        console.error('Failed to start conversation:', error);
        throw error;
    }
};
