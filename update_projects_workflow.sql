
-- Update projects table status default and existing records
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'open';
UPDATE public.projects SET status = 'open' WHERE status = 'pending' AND editor_id IS NULL;

-- Ensure RLS policies are correct for the workflow
-- Editors need to be able to update projects to accept them
DROP POLICY IF EXISTS "Enable update for project owners and assigned editors" ON public.projects;
CREATE POLICY "Enable update for project owners and assigned editors" 
ON public.projects FOR UPDATE 
USING (
  auth.uid() = client_id OR 
  auth.uid() = editor_id OR 
  (status = 'open' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'editor')
);

-- Add a column for rejection reason if needed, but the user didn't ask for it.
-- They asked for "The uploaded files/work by the editor should be deleted or unlinked."
-- We have submission_url in projects table.

-- Real-time is already enabled for projects usually, but let's make sure.
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION WHEN OTHERS THEN NULL; -- Ignore if already added
