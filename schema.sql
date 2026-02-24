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

-- Profile Policies
alter table public.profiles enable row level security;

drop policy if exists "view_editor_profiles" on public.profiles;
create policy "view_editor_profiles" on public.profiles for select to authenticated using (role = 'editor' or auth.uid() = id);

drop policy if exists "update_own_profile" on public.profiles;
create policy "update_own_profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "insert_own_profile" on public.profiles;
create policy "insert_own_profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

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

-- 4. INQUIRIES TABLE
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
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

-- 5. CHATS AND MESSAGES
create table if not exists public.chats (
    id uuid default gen_random_uuid() primary key,
    client_id uuid not null references auth.users(id) on delete cascade,
    editor_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(client_id, editor_id)
);

create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid not null references public.chats(id) on delete cascade,
    sender_id uuid not null references auth.users(id) on delete cascade,
    sender_role text not null check (sender_role in ('client', 'editor')),
    message text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for chats and messages
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policies for chats
drop policy if exists "Users can view their own chats" on public.chats;
create policy "Users can view their own chats"
    on public.chats for select
    using (auth.uid() = client_id or auth.uid() = editor_id);

drop policy if exists "Users can insert their own chats" on public.chats;
create policy "Users can insert their own chats"
    on public.chats for insert
    with check (auth.uid() = client_id or auth.uid() = editor_id);

-- Policies for messages
drop policy if exists "Users can view messages in their chats" on public.messages;
create policy "Users can view messages in their chats"
    on public.messages for select
    using (
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
            and (c.client_id = auth.uid() or c.editor_id = auth.uid())
        )
    );

drop policy if exists "Users can insert messages in their chats" on public.messages;
create policy "Users can insert messages in their chats"
    on public.messages for insert
    with check (
        auth.uid() = sender_id and
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
            and (c.client_id = auth.uid() or c.editor_id = auth.uid())
        )
    );

-- Indexes
create index if not exists idx_chats_client_id on public.chats(client_id);
create index if not exists idx_chats_editor_id on public.chats(editor_id);
create index if not exists idx_messages_chat_id on public.messages(chat_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
