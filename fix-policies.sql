-- Fix infinite recursion in RLS policies
-- Run this script to replace the problematic policies

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view projects they admin or are members of" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view project memberships" ON project_members;
DROP POLICY IF EXISTS "Project admins can manage members" ON project_members;
DROP POLICY IF EXISTS "Project admins can insert members" ON project_members;
DROP POLICY IF EXISTS "Project admins can update members" ON project_members;
DROP POLICY IF EXISTS "Project admins can delete members" ON project_members;
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they're assigned or admin projects" ON tasks;
DROP POLICY IF EXISTS "Project admins can create tasks" ON tasks;
DROP POLICY IF EXISTS "Project admins can delete tasks" ON tasks;

-- Create simple, non-recursive policies

-- Profiles policies (simple and safe)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies (simple ownership check)
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins can update their own projects" ON projects
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Admins can delete their own projects" ON projects
  FOR DELETE USING (admin_id = auth.uid());

-- Project members policies (simple checks)
CREATE POLICY "Users can view their own memberships" ON project_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Project admins can view their project members" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can insert members" ON project_members
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can update members" ON project_members
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can delete members" ON project_members
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

-- Tasks policies (simple checks)
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Project admins can view project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Project admins can update project tasks" ON tasks
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can delete tasks" ON tasks
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE admin_id = auth.uid()
    )
  );
