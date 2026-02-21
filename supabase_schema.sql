-- 1. Reset Database (Drop tables and their policies)
drop table if exists public.inquiries cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- 2. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null check (role in ('client', 'editor', 'admin')),
  name text,
  bio text,
  skills text[],
  subscription_status text default 'inactive',
  plan_name text,
  subscription_expiry timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) not null,
  editor_id uuid references public.profiles(id),
  title text not null,
  description text not null,
  budget text,
  deadline date,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  submission_url text,
  rating int,
  feedback text,
  created_at timestamp with time zone default now()
);

-- 4. Create Inquiries Table
create table public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- 5. Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.inquiries enable row level security;

-- 6. Create Policies

-- Profiles
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can delete users" on public.profiles for delete using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'admin'));

-- Projects
create policy "Projects are viewable by everyone" on public.projects for select using (true);
create policy "Clients can insert projects" on public.projects for insert with check (auth.uid() = client_id);
create policy "Clients can update their own projects" on public.projects for update using (auth.uid() = client_id);
create policy "Clients can delete their own projects" on public.projects for delete using (auth.uid() = client_id);
create policy "Editors can update assigned projects" on public.projects for update using (auth.uid() = editor_id);
create policy "Admins can delete projects" on public.projects for delete using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'admin'));

-- Inquiries
create policy "Anyone can insert inquiries" on public.inquiries for insert with check (true);
create policy "Admins can view inquiries" on public.inquiries for select using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'admin'));
create policy "Admins can delete inquiries" on public.inquiries for delete using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'admin'));
