-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    dependencies UUID[], -- Array of task IDs that this task depends on
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_admin_id ON projects(admin_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view profiles of people in their projects
CREATE POLICY "Users can view profiles of project members" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_members pm1
        JOIN project_members pm2 ON pm1.project_id = pm2.project_id
        WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
    )
);

-- Projects policies
CREATE POLICY "Users can view projects they admin or are members of" ON projects FOR SELECT USING (
    admin_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = projects.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (admin_id = auth.uid());
CREATE POLICY "Project admins can update their projects" ON projects FOR UPDATE USING (admin_id = auth.uid());
CREATE POLICY "Project admins can delete their projects" ON projects FOR DELETE USING (admin_id = auth.uid());

-- Project members policies
CREATE POLICY "Users can view project members for projects they have access to" ON project_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_members.project_id AND (
            admin_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM project_members pm 
                WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Project admins can manage project members" ON project_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_members.project_id AND admin_id = auth.uid()
    )
);

-- Tasks policies
CREATE POLICY "Users can view tasks for projects they have access to" ON tasks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = tasks.project_id AND (
            admin_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM project_members pm 
                WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Project admins can manage all tasks in their projects" ON tasks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = tasks.project_id AND admin_id = auth.uid()
    )
);

CREATE POLICY "Users can update tasks assigned to them" ON tasks FOR UPDATE USING (
    assigned_to = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = tasks.project_id AND (
            admin_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM project_members pm 
                WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
            )
        )
    )
);

-- Function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
