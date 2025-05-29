# Setup Guide for Gantt Chart for Team Leader

## Quick Setup Steps

### 1. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire content from `supabase-schema.sql`
4. Run the SQL script to create all tables, policies, and functions

### 2. Environment Configuration

Your `.env.local` file is already configured with your Supabase credentials:
- Project URL: `https://pxqiuiynljpjdrsruozv.supabase.co`
- Anon Key: Already set
- Service Role Key: Already set

### 3. Authentication Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Make sure Email authentication is enabled
3. Configure your site URL to `http://localhost:3000` for development
4. For production, update it to your actual domain

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing the Application

### Create Admin User
1. Go to `/auth` and create an account
2. Select "Admin" role during signup
3. Verify your email if required

### Create Team Member
1. Create another account with "Team Member" role
2. The admin can then add this user to projects

### Test Workflow
1. **Admin**: Create a new project
2. **Admin**: Add team members to the project
3. **Admin**: Create tasks and assign them to team members
4. **Team Member**: Log in and update task progress
5. **Admin**: View overall project progress

## Database Schema Overview

The application creates these tables:
- `profiles` - User information and roles
- `projects` - Project data
- `project_members` - Team membership
- `tasks` - Individual tasks with timeline and progress

All tables have Row Level Security (RLS) enabled for data protection.

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check that email auth is enabled in Supabase
2. **Database errors**: Ensure the SQL schema was run completely
3. **Permission errors**: Verify RLS policies are in place
4. **Environment variables**: Double-check `.env.local` values

### Database Reset

If you need to reset the database:
1. Go to Supabase SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run the `supabase-schema.sql` script

## Next Steps

Once the basic setup is working:
1. Customize the dark theme colors in `globals.css`
2. Add your company branding
3. Configure email templates in Supabase
4. Set up production deployment on Vercel

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Supabase logs in your dashboard
3. Ensure all environment variables are correct
4. Verify the database schema was applied successfully
