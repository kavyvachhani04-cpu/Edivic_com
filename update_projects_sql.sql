-- Run this SQL in your Supabase SQL Editor to update the projects table

-- 1. Add the category column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Video Editing';

-- 2. Add client_name column if it doesn't exist (optional, but good for display)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS client_name text;

-- 3. (Optional) If you want to recreate the table entirely (WARNING: DELETES DATA)
/*
DROP TABLE IF EXISTS public.projects;
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users(id) not null,
  client_name text,
  title text not null,
  description text not null,
  budget text not null,
  deadline date not null,
  category text not null,
  status text not null default 'pending', -- pending, assigned, completed
  editor_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.projects enable row level security;
create policy "Projects are viewable by everyone" on public.projects for select using (true);
create policy "Clients can insert their own projects" on public.projects for insert with check (auth.uid() = client_id);
create policy "Clients can update their own projects" on public.projects for update using (auth.uid() = client_id);
create policy "Editors can update projects" on public.projects for update using (exists (select 1 from profiles where id = auth.uid() and role = 'editor'));
create policy "Admins can do everything" on public.projects for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
*/
