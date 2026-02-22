-- Run this SQL in your Supabase SQL Editor to update the profiles table

-- Add new columns for Editor Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_project text,
ADD COLUMN IF NOT EXISTS hourly_rate text,
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Update RLS policies to allow public read of profiles (or at least authenticated read)
-- Existing policies might already cover this, but let's ensure it.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Allow admins to update any profile (for featuring)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
