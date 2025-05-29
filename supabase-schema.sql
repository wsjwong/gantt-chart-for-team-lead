-- Migration script to convert from project-based to team-based structure
-- This handles existing data and creates new tables

-- First, create the new teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Check if projects table has team_id column, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'team_id'
  ) THEN
    -- Add team_id column to existing projects table
    ALTER TABLE projects ADD COLUMN team_id UUID;
    
    -- Create a default team for each project admin and link projects to teams
    INSERT INTO teams (name, admin_id)
    SELECT DISTINCT 
      COALESCE(p.name || '''s Team', 'Default Team'),
      p.admin_id
    FROM projects p
    WHERE NOT EXISTS (
      SELECT 1 FROM teams t WHERE t.admin_id = p.admin_id
    );
    
    -- Update projects to reference the appropriate team
    UPDATE projects 
    SET team_id = (
      SELECT t.id 
      FROM teams t 
      WHERE t.admin_id = projects.admin_id
      LIMIT 1
    );
    
    -- Make team_id NOT NULL after populating it
    ALTER TABLE projects ALTER COLUMN team_id SET NOT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE projects ADD CONSTRAINT projects_team_id_fkey 
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migrate project_members to team_members
INSERT INTO team_members (team_id, user_id)
SELECT DISTINCT p.team_id, pm.user_id
FROM project_members pm
JOIN projects p ON pm.project_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM team_members tm 
  WHERE tm.team_id = p.team_id AND tm.user_id = pm.user_id
);

-- Drop the old project_members table since we now use team_members
DROP TABLE IF EXISTS project_members CASCADE;

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create triggers
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

-- Drop and recreate the signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_admin_id ON teams(admin_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_admin_id ON projects(admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view teams they admin" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Admins can update their own teams" ON teams;
DROP POLICY IF EXISTS "Admins can delete their own teams" ON teams;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Users can view tasks they're assigned" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they're assigned" ON tasks;

-- Create basic policies
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

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their own teams" ON teams
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their own teams" ON teams
  FOR DELETE USING (admin_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view their own team memberships" ON team_members
  FOR SELECT USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Team admins can manage projects" ON projects
  FOR ALL USING (admin_id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can view tasks they're assigned" ON tasks
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Users can update tasks they're assigned" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());
