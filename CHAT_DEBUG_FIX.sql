
-- CHAT DEBUG & REALTIME FIX

-- 1. Enable Realtime for messages table
-- This allows the frontend to receive instant updates when a new message is inserted.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- 2. Create a trigger to update chats.updated_at when a new message is inserted
-- This ensures that the conversation list is sorted by the most recent activity.
CREATE OR REPLACE FUNCTION public.update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_timestamp();

-- 3. Ensure RLS policies are robust for Realtime
-- Realtime requires the user to have SELECT permission on the table.
-- We already have these in MASTER_SCHEMA_FIX.sql, but let's re-verify/ensure.

-- Chats SELECT policy
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats" ON public.chats 
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = editor_id);

-- Messages SELECT policy
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats" ON public.messages 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.id = messages.chat_id
        AND (c.client_id = auth.uid() OR c.editor_id = auth.uid())
    )
);

-- 4. Fix potential issue with startConversation unique constraint
-- If a chat was deleted but the unique constraint remains, we might have issues.
-- The UNIQUE(client_id, editor_id) is already in MASTER_SCHEMA_FIX.sql.

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON public.chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chats_editor_id ON public.chats(editor_id);
