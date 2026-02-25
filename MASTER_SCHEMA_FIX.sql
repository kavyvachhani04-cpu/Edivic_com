
-- MASTER SCHEMA FIX
-- This script ensures all tables and columns exist as expected by the application code.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    full_name TEXT,
    username TEXT,
    role TEXT CHECK (role IN ('client', 'editor', 'admin')),
    bio TEXT,
    skills TEXT, -- Can be text or text[] depending on usage, we'll ensure it's text for broad compatibility or handle conversion
    experience TEXT,
    rating NUMERIC DEFAULT 0,
    price_per_project TEXT,
    hourly_rate TEXT,
    price_per_hour NUMERIC,
    profile_photo TEXT,
    profile_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    subscription_status TEXT DEFAULT 'inactive',
    plan_name TEXT DEFAULT 'None',
    subscription_expiry TIMESTAMP WITH TIME ZONE,
    portfolio_url TEXT,
    primary_software TEXT,
    years_experience TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist in profiles (in case table existed but was missing columns)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_image_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'plan_name') THEN
        ALTER TABLE public.profiles ADD COLUMN plan_name TEXT DEFAULT 'None';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_expiry') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_expiry TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'portfolio_url') THEN
        ALTER TABLE public.profiles ADD COLUMN portfolio_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'primary_software') THEN
        ALTER TABLE public.profiles ADD COLUMN primary_software TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'years_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN years_experience TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'price_per_hour') THEN
        ALTER TABLE public.profiles ADD COLUMN price_per_hour NUMERIC;
    END IF;
END $$;

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget TEXT,
    deadline TEXT, -- Some parts use DATE, some use TEXT (from input), TEXT is safer for mixed formats
    status TEXT DEFAULT 'open',
    submission_url TEXT,
    category TEXT,
    skills TEXT,
    experience_level TEXT,
    rating NUMERIC,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist in projects
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
        ALTER TABLE public.projects ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'skills') THEN
        ALTER TABLE public.projects ADD COLUMN skills TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'experience_level') THEN
        ALTER TABLE public.projects ADD COLUMN experience_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'rating') THEN
        ALTER TABLE public.projects ADD COLUMN rating NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'feedback') THEN
        ALTER TABLE public.projects ADD COLUMN feedback TEXT;
    END IF;
END $$;

-- 3. CHATS TABLE
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    editor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, editor_id)
);

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'editor')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure file columns exist in messages
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_name') THEN
        ALTER TABLE public.messages ADD COLUMN file_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_type') THEN
        ALTER TABLE public.messages ADD COLUMN file_type TEXT;
    END IF;
END $$;

-- 5. RLS POLICIES (Reset and Fix)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects Policies
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can insert projects" ON public.projects;
CREATE POLICY "Clients can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Owners and editors can update projects" ON public.projects;
CREATE POLICY "Owners and editors can update projects" ON public.projects FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = editor_id);

-- Chats Policies
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats" ON public.chats FOR SELECT USING (auth.uid() = client_id OR auth.uid() = editor_id);

DROP POLICY IF EXISTS "Users can insert their own chats" ON public.chats;
CREATE POLICY "Users can insert their own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = editor_id);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.id = messages.chat_id
        AND (c.client_id = auth.uid() OR c.editor_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.messages;
CREATE POLICY "Users can insert messages in their chats" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.id = messages.chat_id
        AND (c.client_id = auth.uid() OR c.editor_id = auth.uid())
    )
);

-- 6. STORAGE BUCKET
-- Ensure chat-attachments bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Allow authenticated users to upload chat attachments" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Allow users to view chat attachments" ON storage.objects;
CREATE POLICY "Allow users to view chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');
