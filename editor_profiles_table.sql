-- Create or update profiles table for editor profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('client', 'editor', 'admin')),
  full_name TEXT,
  email TEXT,
  bio TEXT,
  skills TEXT[], -- Array of text for skills
  price_per_hour NUMERIC,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If the table already existed, ensure the new columns are present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'price_per_hour') THEN
        ALTER TABLE public.profiles ADD COLUMN price_per_hour NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_image_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_image_url TEXT;
    END IF;
    
    -- Note: Changing skills from TEXT to TEXT[] requires a migration if data exists.
    -- For this setup, we assume we can set it or it's already compatible.
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. All authenticated users can read editor profiles
-- (Clients need to find editors, editors might want to see each other)
DROP POLICY IF EXISTS "view_editor_profiles" ON public.profiles;
CREATE POLICY "view_editor_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'editor' OR auth.uid() = id);

-- 2. Only the user themselves can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile during signup
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
