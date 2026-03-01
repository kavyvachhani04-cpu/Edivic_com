-- Drop existing tables to rebuild from scratch
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS demo_videos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('client', 'editor')),
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_videos table
CREATE TABLE demo_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC,
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_demo_videos_editor_id ON demo_videos(editor_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_editor_id ON projects(editor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_chats_project_id ON chats(project_id);
CREATE INDEX idx_chats_participants ON chats(client_id, editor_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Demo Videos
CREATE POLICY "Public view demo videos" ON demo_videos
  FOR SELECT USING (true);

CREATE POLICY "Editors manage own videos" ON demo_videos
  FOR ALL USING (auth.uid() = editor_id);

-- Projects
CREATE POLICY "Clients view own projects" ON projects
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Editors view assigned projects" ON projects
  FOR SELECT USING (auth.uid() = editor_id);

CREATE POLICY "Clients manage own projects" ON projects
  FOR ALL USING (auth.uid() = client_id);

-- Chats
CREATE POLICY "Participants view chats" ON chats
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = editor_id);

CREATE POLICY "Participants insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = editor_id);

-- Messages
CREATE POLICY "Chat participants view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.client_id = auth.uid() OR chats.editor_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_id
      AND (chats.client_id = auth.uid() OR chats.editor_id = auth.uid())
    )
  );

-- Reviews
CREATE POLICY "Project users view reviews" ON reviews
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = editor_id);

CREATE POLICY "Clients create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
