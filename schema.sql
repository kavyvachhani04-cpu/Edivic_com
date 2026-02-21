-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- 1. PROFILES TABLE (Assuming this already exists, but including for completeness of schema file)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  role text check (role in ('client', 'editor', 'admin')) not null,
  skills text,
  bio text,
  subscription_status text check (subscription_status in ('active', 'inactive')) default 'inactive',
  plan_name text,
  subscription_expiry timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROJECTS TABLE (User provided definition)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users(id) not null,
  editor_id uuid references auth.users(id),
  title text not null,
  description text not null,
  budget text,
  deadline date,
  status text default 'pending', -- pending, in_progress, submitted, completed, cancelled
  submission_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
-- Drop existing policies if they exist to avoid errors on re-run
drop policy if exists "Enable read access for all authenticated users" on public.projects;
drop policy if exists "Enable insert for authenticated users" on public.projects;
drop policy if exists "Enable update for project owners and assigned editors" on public.projects;

create policy "Enable read access for all authenticated users" on public.projects for select using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on public.projects for insert with check (auth.uid() = client_id);
create policy "Enable update for project owners and assigned editors" on public.projects for update using (auth.uid() = client_id or auth.uid() = editor_id);

-- 3. UPDATE PROFILES (Add new columns)
-- Using do block to avoid errors if columns already exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'portfolio_url') then
        alter table public.profiles add column portfolio_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'primary_software') then
        alter table public.profiles add column primary_software text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'years_experience') then
        alter table public.profiles add column years_experience text;
    end if;
end $$;

-- 4. INQUIRIES TABLE (Keeping this from previous context)
create table if not exists public.inquiries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can insert inquiries" on public.inquiries;
create policy "Anyone can insert inquiries" on public.inquiries for insert with check ( true );

drop policy if exists "Admins can view inquiries" on public.inquiries;
create policy "Admins can view inquiries" on public.inquiries for select using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
);

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries" on public.inquiries for delete using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
);
