-- Ensure all necessary columns exist in profiles and projects tables

-- Profiles table updates
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_project text,
ADD COLUMN IF NOT EXISTS hourly_rate text,
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Projects table updates
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS rating numeric,
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS submission_url text;

-- Ensure RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
