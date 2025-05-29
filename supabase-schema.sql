-- Drop all existing tables and policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Project members can view project memberships" ON project_members;
DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Team members can update their assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view teams they admin" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Admins can update their own teams" ON teams;
DROP POLICY IF EXISTS "Admins can delete their own teams" ON teams;
DROP POLICY IF EXISTS "Team members can view teams" ON teams;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON team_members;
DROP POLICY IF EXISTS "Team admins can view all team memberships" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team memberships" ON team_members;
DROP POLICY IF EXISTS "Team admins can update team memberships" ON team_members;
DROP POLICY IF EXISTS "Team admins can delete team memberships" ON team_members;
DROP POLICY IF EXISTS "Team members can view projects" ON projects;
DROP POLICY IF EXISTS "Team admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Project admins can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Project members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Project admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Team members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Team admins can manage all tasks" ON tasks;

-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table (main organizational unit)
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create projects table (belongs to teams)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  dependencies UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions and triggers for updated_at (create before enabling RLS)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security AFTER creating all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies AFTER enabling RLS and ensuring all tables exist
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Users can view teams they admin" ON teams
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Team members can view teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their own teams" ON teams
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their own teams" ON teams
  FOR DELETE USING (admin_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view their own team memberships" ON team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team admins can view all team memberships" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team memberships" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update team memberships" ON team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can delete team memberships" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Team members can view projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = projects.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE id = team_id AND admin_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Team members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = project_id AND (
        t.admin_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = t.id AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team admins can manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = project_id AND t.admin_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update their assigned tasks" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE p.id = project_id AND tm.user_id = auth.uid()
    )
  );

-- Create indexes for better performance (at the end)
CREATE INDEX idx_teams_admin_id ON teams(admin_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_admin_id ON projects(admin_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_start_date ON tasks(start_date);
CREATE INDEX idx_tasks_end_date ON tasks(end_date);
