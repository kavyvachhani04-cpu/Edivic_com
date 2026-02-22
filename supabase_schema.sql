-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles table if it doesn't exist (or update it)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT, -- 'client' or 'editor'
  profile_photo TEXT,
  skills TEXT,
  bio TEXT,
  experience TEXT,
  hourly_rate TEXT,
  rating FLOAT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- POLICY: Allow public read access to profiles (so clients can see editors)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- POLICY: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- POLICY: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create an index on role for faster filtering
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
