
-- 1. Create demo_videos table
CREATE TABLE IF NOT EXISTS public.demo_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    editor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.demo_videos ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for demo_videos
DROP POLICY IF EXISTS "Demo videos are viewable by everyone" ON public.demo_videos;
CREATE POLICY "Demo videos are viewable by everyone" 
ON public.demo_videos FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Editors can insert their own demo videos" ON public.demo_videos;
CREATE POLICY "Editors can insert their own demo videos" 
ON public.demo_videos FOR INSERT 
WITH CHECK (auth.uid() = editor_id);

DROP POLICY IF EXISTS "Editors can update their own demo videos" ON public.demo_videos;
CREATE POLICY "Editors can update their own demo videos" 
ON public.demo_videos FOR UPDATE 
USING (auth.uid() = editor_id);

DROP POLICY IF EXISTS "Editors can delete their own demo videos" ON public.demo_videos;
CREATE POLICY "Editors can delete their own demo videos" 
ON public.demo_videos FOR DELETE 
USING (auth.uid() = editor_id);

-- 4. Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-videos', 'demo-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for demo-videos bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'demo-videos');

DROP POLICY IF EXISTS "Editors can upload demo videos" ON storage.objects;
CREATE POLICY "Editors can upload demo videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'demo-videos');

DROP POLICY IF EXISTS "Editors can delete their own demo videos" ON storage.objects;
CREATE POLICY "Editors can delete their own demo videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'demo-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
