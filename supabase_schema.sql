-- Create projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users(id) not null,
  client_name text not null,
  project_title text not null,
  project_description text not null,
  budget text not null,
  deadline date not null,
  category text not null,
  status text not null default 'open', -- open, assigned, completed
  editor_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Projects are viewable by everyone" on public.projects
  for select using (true);

create policy "Clients can insert their own projects" on public.projects
  for insert with check (auth.uid() = client_id);

create policy "Clients can update their own projects" on public.projects
  for update using (auth.uid() = client_id);

create policy "Editors can update projects (e.g. accept)" on public.projects
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'editor'
    )
  );

create policy "Admins can do everything" on public.projects
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
