-- Fix script for team management modal issues
-- Run this in your Supabase SQL Editor

-- 1. First, create profiles for any auth.users that don't have profiles
INSERT INTO public.profiles (id, email, full_name, invitation_status, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
    'accepted',
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- 2. Update any profiles that might be missing email addresses
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- 3. Ensure all profiles have proper invitation_status
UPDATE public.profiles 
SET invitation_status = 'accepted',
    updated_at = NOW()
WHERE invitation_status IS NULL;

-- 4. Check and fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of project members" ON public.profiles;
DROP POLICY IF EXISTS "Invited users can view inviter profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to view profiles of people in their projects
CREATE POLICY "Users can view profiles of project members" ON public.profiles
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT pm.user_id 
            FROM public.project_members pm
            JOIN public.projects p ON pm.project_id = p.id
            WHERE p.admin_id = auth.uid()
        )
        OR 
        id IN (
            SELECT DISTINCT p.admin_id
            FROM public.project_members pm
            JOIN public.projects p ON pm.project_id = p.id
            WHERE pm.user_id = auth.uid()
        )
    );

-- Allow users to view profiles of people they invited
CREATE POLICY "Invited users can view inviter profile" ON public.profiles
    FOR SELECT USING (invited_by = auth.uid() OR auth.uid() = invited_by);

-- 5. Check and fix RLS policies for project_members table
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can view their project members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can insert members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can delete members" ON public.project_members;

-- Create comprehensive RLS policies for project_members
CREATE POLICY "Users can view their own memberships" ON public.project_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Project admins can manage their project members" ON public.project_members
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE admin_id = auth.uid()
        )
    );

-- 6. Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;

-- 8. Final verification query - run this to see what should be visible
SELECT 
    'Current user profile' as type,
    p.id,
    p.email,
    p.full_name,
    p.invitation_status
FROM public.profiles p
WHERE p.id = auth.uid()

UNION ALL

SELECT 
    'Project members' as type,
    p.id,
    p.email,
    p.full_name,
    p.invitation_status
FROM public.profiles p
WHERE p.id IN (
    SELECT DISTINCT pm.user_id 
    FROM public.project_members pm
    JOIN public.projects pr ON pm.project_id = pr.id
    WHERE pr.admin_id = auth.uid()
)

UNION ALL

SELECT 
    'Invited users' as type,
    p.id,
    p.email,
    p.full_name,
    p.invitation_status
FROM public.profiles p
WHERE p.invited_by = auth.uid()
ORDER BY type, email;
