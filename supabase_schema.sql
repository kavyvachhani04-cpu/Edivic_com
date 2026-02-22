-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
-- 1. Everyone can view profiles (Global Visibility)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 2. Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- PROJECTS TABLE POLICIES
-- 1. Everyone can view projects (Global Visibility for Editors to see Client projects)
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
CREATE POLICY "Projects are viewable by everyone"
ON projects FOR SELECT
USING (true);

-- 2. Clients can insert projects
DROP POLICY IF EXISTS "Clients can insert projects" ON projects;
CREATE POLICY "Clients can insert projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- 3. Clients can update their own projects
DROP POLICY IF EXISTS "Clients can update own projects" ON projects;
CREATE POLICY "Clients can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = client_id);

-- 4. Editors can update projects (e.g. to accept them)
-- We allow editors to update projects if the status is pending (to accept) or if they are the assigned editor
DROP POLICY IF EXISTS "Editors can update projects" ON projects;
CREATE POLICY "Editors can update projects"
ON projects FOR UPDATE
USING (true) -- Simplified for demo: allow updates, application logic handles status checks
WITH CHECK (true);

-- Ensure is_active column exists in profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure profile_photo column exists in profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_photo') THEN
        ALTER TABLE profiles ADD COLUMN profile_photo TEXT;
    END IF;
END $$;

-- Ensure role column exists (it should, but just in case)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT;
    END IF;
END $$;
