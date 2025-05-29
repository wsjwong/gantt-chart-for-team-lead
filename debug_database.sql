-- Debug script to check database state and fix team management modal issues

-- 1. Check what users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check what profiles exist
SELECT 
    id,
    email,
    full_name,
    invitation_status,
    invited_by,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Check what projects exist
SELECT 
    id,
    name,
    admin_id,
    start_date,
    end_date,
    created_at
FROM public.projects
ORDER BY created_at DESC;

-- 4. Check what project members exist
SELECT 
    pm.id,
    pm.project_id,
    pm.user_id,
    p.name as project_name,
    pr.email as user_email
FROM public.project_members pm
LEFT JOIN public.projects p ON pm.project_id = p.id
LEFT JOIN public.profiles pr ON pm.user_id = pr.id
ORDER BY pm.created_at DESC;

-- 5. Check RLS policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
