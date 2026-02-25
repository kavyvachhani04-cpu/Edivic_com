
-- 1. Ensure full_name column exists (required by AuthContext and Chat)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Ensure username column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 3. Update existing profiles to have a default username 
-- We use a DO block to safely handle the update logic
DO $$
BEGIN
    UPDATE public.profiles 
    SET username = COALESCE(full_name, name, split_part(email, '@', 1))
    WHERE username IS NULL;
EXCEPTION
    WHEN undefined_column THEN
        -- Fallback if full_name still somehow causes issues in the same transaction
        UPDATE public.profiles 
        SET username = COALESCE(name, split_part(email, '@', 1))
        WHERE username IS NULL;
END $$;
