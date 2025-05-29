-- Add your account to the mock data so you can see the projects
-- Replace 'your-actual-user-id-here' with your actual Supabase auth user ID

-- First, let's add your profile if it doesn't exist
INSERT INTO profiles (id, email, full_name, invitation_status) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com'),
  'wsjwong@outlook.com', 
  'WSJ Wong', 
  'accepted'
) 
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  invitation_status = EXCLUDED.invitation_status;

-- Option 1: Make you the admin of some existing projects
-- This will transfer ownership of a few projects to your account
UPDATE projects 
SET admin_id = (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com')
WHERE name IN ('Troubleshooting', 'PWH LAS', 'QMH Pivka +RUO+A1c');

-- Option 2: Add you as a member to all projects (so you can see them all)
-- This adds you as a team member to every project
INSERT INTO project_members (id, project_id, user_id)
SELECT 
  gen_random_uuid(),
  p.id,
  (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com')
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM project_members pm 
  WHERE pm.project_id = p.id 
  AND pm.user_id = (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com')
);

-- Option 3: Create a few new projects specifically for your account
INSERT INTO projects (id, name, start_date, end_date, admin_id) VALUES
(gen_random_uuid(), 'My Test Project 1', '2024-06-01', '2024-08-31', (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com')),
(gen_random_uuid(), 'My Test Project 2', '2024-07-15', '2024-09-30', (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com')),
(gen_random_uuid(), 'My Test Project 3', '2024-08-01', '2024-12-15', (SELECT id FROM auth.users WHERE email = 'wsjwong@outlook.com'));
