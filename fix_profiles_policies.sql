-- Robust script to update profiles table and policies
-- This script handles existing policies to avoid "already exists" errors

DO $$
BEGIN
    -- 1. Drop existing policies to ensure a clean slate
    -- We use a block to ignore errors if the policy doesn't exist (though DROP POLICY IF EXISTS should handle it)
    DROP POLICY IF EXISTS "Allow authenticated users to read editor profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
    
    -- Also drop any other common policy names that might conflict
    DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
END $$;

-- 2. Ensure table structure is correct
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor' CHECK (role IN ('client', 'editor', 'admin')),
  full_name TEXT,
  email TEXT,
  bio TEXT,
  skills TEXT[], 
  price_per_hour NUMERIC,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add columns if they are missing (for existing tables)
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'editor' CHECK (role IN ('client', 'editor', 'admin'));
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Recreate Policies

-- All authenticated users can read editor profiles
CREATE POLICY "view_editor_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'editor' OR auth.uid() = id);

-- Only the user themselves can update their own profile
CREATE POLICY "update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile during signup
CREATE POLICY "insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
