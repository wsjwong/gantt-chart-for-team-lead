-- Fix RLS policies to allow user invitations
-- Run this in your Supabase SQL Editor

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can invite new users" ON public.profiles;

-- Create new policy that allows users to insert their own profile OR invite others
CREATE POLICY "Users can insert their own profile or invite others" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id  -- Users can insert their own profile
        OR 
        (invitation_status = 'pending' AND invited_by = auth.uid())  -- Users can invite others
    );

-- Also ensure users can update invitations they sent
DROP POLICY IF EXISTS "Users can update their own profile or invitations" ON public.profiles;
CREATE POLICY "Users can update their own profile or invitations" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id  -- Users can update their own profile
        OR 
        (invitation_status = 'pending' AND invited_by = auth.uid())  -- Users can update invitations they sent
    );

-- Allow users to delete pending invitations they sent
DROP POLICY IF EXISTS "Users can delete pending invitations they sent" ON public.profiles;
CREATE POLICY "Users can delete pending invitations they sent" ON public.profiles
    FOR DELETE USING (
        invitation_status = 'pending' AND invited_by = auth.uid()
    );

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
