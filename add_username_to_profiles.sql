
-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Update existing profiles to have a username based on their name or email if missing
UPDATE public.profiles 
SET username = COALESCE(full_name, name, split_part(email, '@', 1))
WHERE username IS NULL;
