-- Add skills and experience_level columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS experience_level text;
