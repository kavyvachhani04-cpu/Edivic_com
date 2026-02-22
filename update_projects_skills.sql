-- Add missing columns to projects table
DO $$
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
        ALTER TABLE projects ADD COLUMN category TEXT;
    END IF;

    -- Add skills column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'skills') THEN
        ALTER TABLE projects ADD COLUMN skills TEXT;
    END IF;

    -- Add experience_level column if it doesn't exist (even if removed from UI, it might be in schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'experience_level') THEN
        ALTER TABLE projects ADD COLUMN experience_level TEXT;
    END IF;

    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'rating') THEN
        ALTER TABLE projects ADD COLUMN rating INTEGER;
    END IF;

    -- Add feedback column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'feedback') THEN
        ALTER TABLE projects ADD COLUMN feedback TEXT;
    END IF;
END $$;
