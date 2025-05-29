-- Migration to move invited users to profiles table and add invitation status

-- Step 1: Remove the foreign key constraint from profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Add invitation_status column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Step 3: Create a foreign key constraint for invited_by that references profiles
ALTER TABLE profiles ADD CONSTRAINT profiles_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 4: Migrate existing invited users to profiles table
INSERT INTO profiles (id, email, full_name, invitation_status, invited_by, invited_at, created_at, updated_at)
SELECT 
    id,
    email,
    NULL as full_name,
    'pending' as invitation_status,
    invited_by,
    created_at as invited_at,
    created_at,
    NOW() as updated_at
FROM invited_users
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update profiles policies to handle invited users
DROP POLICY IF EXISTS "Users can view profiles of project members" ON profiles;
CREATE POLICY "Users can view profiles of project members" ON profiles FOR SELECT USING (
    -- Users can view their own profile
    auth.uid() = id OR
    -- Users can view profiles of people in their projects
    EXISTS (
        SELECT 1 FROM project_members pm1
        JOIN project_members pm2 ON pm1.project_id = pm2.project_id
        WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
    ) OR
    -- Users can view profiles of people they invited
    invited_by = auth.uid() OR
    -- Users can view profiles of people who invited them
    id IN (SELECT invited_by FROM profiles WHERE id = auth.uid())
);

-- Step 4: Add policy for invited users to view their inviter's profile
CREATE POLICY "Invited users can view inviter profile" ON profiles FOR SELECT USING (
    id IN (SELECT invited_by FROM profiles WHERE id = auth.uid() AND invitation_status = 'pending')
);

-- Step 5: Update project_members policies to allow assignment to invited users
DROP POLICY IF EXISTS "Project admins can manage project members" ON project_members;
CREATE POLICY "Project admins can manage project members" ON project_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_members.project_id AND admin_id = auth.uid()
    )
);

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_invitation_status ON profiles(invitation_status);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON profiles(invited_by);

-- Step 7: Drop the invited_users table
DROP TABLE IF EXISTS invited_users;

-- Step 8: Update the handle_new_user function to set invitation status to accepted for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user already exists as invited user
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = NEW.email AND invitation_status = 'pending') THEN
        -- Update existing invited user record
        UPDATE public.profiles 
        SET 
            id = NEW.id,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
            invitation_status = 'accepted',
            updated_at = NOW()
        WHERE email = NEW.email AND invitation_status = 'pending';
    ELSE
        -- Insert new user profile
        INSERT INTO public.profiles (id, email, full_name, invitation_status, created_at, updated_at)
        VALUES (
            NEW.id, 
            NEW.email, 
            NEW.raw_user_meta_data->>'full_name',
            'accepted',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            invitation_status = 'accepted',
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
