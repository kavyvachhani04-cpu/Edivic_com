
-- Add file attachment columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create storage bucket for chat attachments if it doesn't exist
-- Note: This usually needs to be done via the Supabase dashboard or API, 
-- but we can try to insert into the storage.buckets table if we have permissions.
-- However, the standard way in migrations is to use the storage schema.

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for chat-attachments
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow users to view chat attachments
CREATE POLICY "Allow users to view chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Allow users to delete their own chat attachments (optional, but good practice)
CREATE POLICY "Allow users to delete their own chat attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid() = owner);
