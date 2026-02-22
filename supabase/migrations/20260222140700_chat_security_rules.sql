-- Enable RLS on conversations and messages
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies

-- Clients can view their own conversations
CREATE POLICY "Clients can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  auth.uid() = client_id
);

-- Editors can view their own conversations
CREATE POLICY "Editors can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  auth.uid() = editor_id
);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Users can insert conversations if they are part of it
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = client_id OR auth.uid() = editor_id
);


-- Messages Policies

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.client_id = auth.uid() OR conversations.editor_id = auth.uid())
  )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.client_id = auth.uid() OR conversations.editor_id = auth.uid())
  )
);
