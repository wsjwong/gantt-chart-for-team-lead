# Gantt Chart for Team Lead

A modern SaaS application for team capacity monitoring with Gantt chart functionality, built with Next.js, Tailwind CSS, and Supabase. This tool is specifically designed for team leads to monitor their team capacity with simple project-based tracking, replacing complex task management with streamlined team capacity monitoring.

## Recent Updates

### Latest Fixes (v1.2.2)
- **Fixed Team Invitation RLS Issues** - Resolved "new row violates row-level security policy" error when inviting users
- **Enhanced Invitation Logic** - Updated invitation system to properly handle re-invitations and pending users
- **UUID Generation** - Added proper UUID generation for invited users to prevent database conflicts
- **RLS Policy Updates** - Created comprehensive RLS policies to allow user invitations while maintaining security
- **Improved Error Messages** - Better error handling with specific messages for different invitation scenarios
- **Database Security** - Enhanced row-level security policies for profiles table to support invitation workflow

### Previous Fixes (v1.2.1)
- **Fixed Team Management Modal** - Resolved critical issue where team members were not loading in the manage team modal
- **Enhanced Profile Creation** - Improved user profile creation with upsert functionality to handle race conditions and concurrent access
- **Better Error Handling** - Added comprehensive error messages for profile access issues and RLS policy problems
- **Optimized Data Loading** - Fixed data loading sequence in TeamManagementModal to ensure projects load before team members
- **RLS Policy Improvements** - Enhanced compatibility with Supabase Row Level Security policies
- **Database Cleanup** - Removed unused migration files and setup documentation

## Features

### 🎯 Core Functionality
- **Professional Branding** - Custom logo integration with modern visual identity and properly aligned header navigation
- **Dark Theme UI** - Modern, professional dark interface with consistent styling
- **Pricing Transparency** - Clear pricing tiers with feature comparisons for different team sizes
- **Direct Project Management** - Each team lead manages their own projects directly
- **Team Member Management** - Add/remove team members to/from projects with consistent Google-style team management modal
- **Project Assignment** - Assign team members to projects during creation and editing
- **Invited User Support** - Invite users by email and assign them to projects before they accept the invitation
- **Modal-based Editing** - Streamlined project editing through interactive modals instead of separate pages
- **Interactive Gantt Chart** - Click on any project in the timeline to edit details and manage assignments
- **Project Deletion** - Secure project deletion with admin-only access and confirmation dialogs
- **Team Capacity Tracking** - Visual team capacity monitoring with project timelines and start/end dates
- **Date-based Planning** - Use actual dates instead of week numbers for flexible day/week/month views

### 👥 User Roles

#### Team Lead (Project Admin)
- Full access to all project features
- Create and manage projects with start/end dates
- Add/remove team members to/from projects via consistent modal interface
- Create tasks and assign them to team members
- Edit project details, timelines, and task assignments
- **Delete projects** with proper validation and confirmation (admin-only)
- View project Gantt chart with team member capacity
- Access dedicated team management with unified styling

#### Team Member
- View projects they are assigned to
- View project timeline, team members, and assigned tasks
- See task details including progress and deadlines
- Cannot create projects, manage other users, or create tasks

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15 + React 19 |
| **Styling** | Tailwind CSS 4 |
| **Backend/API** | Supabase (PostgreSQL, Auth, RLS) |
| **Authentication** | Supabase Auth |
| **Database** | PostgreSQL with Row Level Security |
| **Icons** | Lucide React |
| **Hosting** | Vercel (recommended) |
| **AI Integration** | Supabase MCP Server for AI assistants |

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd gantt-chart-for-team-leader
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. In the Supabase SQL Editor, run the schema from `database_migration.sql`
4. Enable email authentication in Authentication > Settings
5. **Optional**: Load mock data by running `mock_data_inserts.sql` in the SQL Editor

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Supabase MCP Server Integration

This project includes integration with the Supabase MCP (Model Context Protocol) Server, which enables AI assistants like Claude, Cursor, and Windsurf to directly interact with your Supabase project.

### What is MCP?

The Model Context Protocol (MCP) standardizes how Large Language Models (LLMs) communicate with external services like Supabase. It allows AI assistants to:
- Manage database tables and schemas
- Execute SQL queries and migrations
- Deploy Edge Functions
- Manage project configurations
- Handle user authentication and permissions

### Available Capabilities

With the Supabase MCP server, AI assistants can:

#### Project Management
- List and manage Supabase projects
- Get project details and configurations
- Create new projects (with cost confirmation)
- Pause and restore projects

#### Database Operations
- List tables and database schemas
- Execute SQL queries for data retrieval
- Apply database migrations for schema changes
- Manage database extensions
- View database logs for debugging

#### Development Tools
- Generate TypeScript types from database schema
- Deploy and manage Edge Functions
- Get project URLs and API keys
- Handle branching for development workflows

### Setup Instructions

The MCP server is already configured for this project. To use it with your AI assistant:

1. **Get your Supabase Personal Access Token**:
   - Go to [Supabase Account Settings](https://supabase.com/dashboard/account/tokens)
   - Create a new personal access token
   - Give it a descriptive name like "AI Assistant MCP"

2. **The server is configured in your MCP settings** with:
   ```json
   {
     "mcpServers": {
       "github.com/supabase-community/supabase-mcp": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--access-token",
           "your_personal_access_token"
         ]
       }
     }
   }
   ```

3. **Available Projects**: The server has access to your Supabase projects including:
   - **Gantt Chart for Team Lead** (Active) - This project
   - Other projects in your Supabase account

### Example AI Commands

With the MCP server active, you can ask your AI assistant to:

```
"Show me the database tables in my Gantt Chart project"
"Generate TypeScript types for my database schema"
"Execute a query to show all active projects"
"Apply a migration to add a new column to the tasks table"
"Deploy an Edge Function for project notifications"
```

### Security & Permissions

- The MCP server uses your personal access token for authentication
- It respects all Supabase Row Level Security (RLS) policies
- Database operations are executed with your user permissions
- All actions are logged and auditable through Supabase

### Benefits for Development

- **Faster Development**: AI can help write and execute database queries
- **Schema Management**: Automated migration generation and application
- **Code Generation**: Auto-generate TypeScript types and API clients
- **Debugging**: AI can analyze logs and suggest solutions
- **Documentation**: AI can explain database schema and relationships

This integration makes the Gantt Chart application more maintainable and allows for rapid development with AI assistance.

## Mock Data

The project includes a comprehensive mock dataset (`mock_data_inserts.sql`) with:

### Team Members (9 profiles)
- Jeffrey Wong (jeffrey.wong@company.com)
- Nerissa Chen (nerissa.chen@company.com)
- Edmund Lee (edmund.lee@company.com)
- Elaine Tam (elaine.tam@company.com)
- Dorothy Liu (dorothy.liu@company.com)
- Jonathan Ng (jonathan.ng@company.com)
- Carson Chan (carson.chan@company.com)
- Melo Kim (melo.kim@company.com)
- Phoebe Zhao (phoebe.zhao@company.com)

### Projects (28 projects)
Includes realistic project names with calculated start/end dates:
- **Troubleshooting** (Week 18-53, 2024)
- **PWH LAS** (Week 7-16, 2024)
- **QMH Pivka +RUO+A1c** (Week 20-22, 2024)
- **UCH LAS** (Week 41-53, 2024)
- **Mass spec training** (Week 22, 2024)
- **KAM training** (Week 23, 2024)
- **Evaluation revamp** (Week 23-31, 2024)
- And 21 more projects covering various medical/lab workflows

### Project Assignments
- Each team member is assigned to multiple projects
- Realistic workload distribution across the team
- Projects span from early 2024 to end of 2024
- Week numbers converted to actual calendar dates

### Loading Mock Data
```sql
-- Run this in Supabase SQL Editor after setting up the schema
-- File: mock_data_inserts.sql

-- This will create:
-- 1. 9 team member profiles with mock emails
-- 2. 28 projects with realistic timelines
-- 3. Project member assignments linking team members to projects
-- 4. Proper UUID generation and constraint handling
```

**Note**: The mock data uses `invitation_status = 'accepted'` to comply with database constraints. All team members are set as active users.

## Database Schema

The application uses a comprehensive database schema for project and task management:

### `profiles`
- User profiles with role-based access
- Links to Supabase auth.users
- Stores user information (full_name, email)
- Supports invitation system with `invitation_status` (pending/accepted)
- Tracks who invited each user with `invited_by` field

### `projects`
- Project information with start and end dates
- Owned by team leader users (admin_id)
- Contains project name, timeline, and timestamps
- Fields: `start_date`, `end_date` for project timeline

### `project_members`
- Junction table for project team members
- Links users to projects they belong to
- Enables project collaboration and access control

### `tasks`
- Individual tasks within projects
- Can be assigned to specific team members
- Contains task details, timeline, progress, and status
- Fields: `name`, `description`, `assigned_to`, `start_date`, `end_date`, `progress`, `status`
- Status options: pending, in_progress, completed, blocked
- Foreign key relationships to projects and profiles

## Key Features Explained

### Authentication & Authorization
- Secure user registration and login via Supabase Auth
- Role-based access control with Row Level Security (RLS)
- Automatic profile creation on user signup

### Enhanced Project Management
- Team leaders create projects with start and end dates
- Comprehensive team member management with dedicated team page
- Team members are added directly to projects with proper access control
- **Invite users by email** and assign them to projects before they accept
- Task creation and assignment to specific team members (including invited users)
- Project-level and task-level progress tracking
- **Secure project deletion** with admin validation and cascade cleanup

### Task Management
- Create tasks within projects with detailed information
- Assign tasks to specific team members
- Track task progress with status updates (pending, in progress, completed, blocked)
- Task timeline management with start and end dates
- Visual task progress indicators

### Team Capacity Management
- Project cards with start/end dates, duration, and team member count
- Automatic progress calculation based on current date vs project timeline
- Visual progress bars showing project completion percentage
- Project editing with date validation and team member management
- **Project deletion** with confirmation dialog and proper cleanup of associated data

### Team Member Capacity Tracking
- Visual representation of team member workload
- Task assignment visibility across projects
- Team member availability and allocation tracking
- Gantt chart showing team member capacity over time

### User Experience
- Responsive design works on desktop and mobile
- Dark theme optimized for professional use
- Consistent design system with unified modal styling
- Intuitive navigation and clear visual hierarchy
- Real-time updates across team members

## Development

### Project Structure
```
src/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard with interactive Gantt chart and project modals
│   ├── globals.css     # Global styles and theme
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/
│   └── TeamManagementModal.tsx  # Google-style team management modal
└── lib/
    └── supabase.ts     # Supabase client and types
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
All environment variables are documented in `.env.local`. Make sure to:
1. Replace placeholder values with your actual Supabase credentials
2. Generate a secure `NEXTAUTH_SECRET` for production
3. Update `NEXTAUTH_URL` for your production domain

## Database Migration

To set up the database schema, run the SQL commands from `supabase-schema.sql`:

```sql
-- Run the commands in supabase-schema.sql to:
-- 1. Create profiles table with user information and invitation support
-- 2. Create projects table with timeline fields
-- 3. Create project_members junction table
-- 4. Create tasks table with assignment and progress tracking
-- 5. Set up Row Level Security (RLS) policies
-- 6. Create proper foreign key relationships
```

### Invitation System Migration

If you have an existing installation with the old `invited_users` table, run the migration script:

```sql
-- Run migrate_invited_users_to_profiles.sql to:
-- 1. Add invitation_status and related fields to profiles table
-- 2. Migrate existing invited users to profiles table
-- 3. Update policies to support invited users
-- 4. Enable project assignment to invited users
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based authentication
- **Role-based Permissions** - Granular access control
- **Input Validation** - Client and server-side validation
- **HTTPS Enforcement** - Secure data transmission

## Streamlined Architecture

This application follows a streamlined architecture where:
- Each team leader manages projects directly with dedicated team management
- Projects have clear timelines with optional task breakdown for better granularity
- Team members are added to specific projects with task assignment capabilities
- The dashboard shows a unified Gantt chart of all projects with team member capacity
- Progress is calculated at both project and task levels
- **Focus on essential project management** without overwhelming complexity

This approach balances simplicity with functionality for effective project management.

## Why This Approach?

This implementation provides the right balance of features:
- **Project-level oversight** - Clear project timelines and progress tracking
- **Task-level granularity** - Optional task breakdown when needed
- **Team member management** - Proper assignment and capacity tracking
- **Date-based planning** - Use actual dates for flexible timeline views
- **Streamlined workflow** - Focus on essential features without bloat
- **Scalable design** - Can handle both simple and complex project structures

Perfect for team leaders who need comprehensive project visibility with the flexibility to add task details when necessary.

## Future Enhancements

### Planned Features
- [x] Invitation system for adding users by email
- [x] Project assignment to invited users before acceptance
- [ ] Enhanced visual Gantt chart with drag-and-drop
- [ ] Project milestones
- [ ] File attachments and comments
- [ ] Email notifications
- [ ] Project templates
- [ ] Reporting and analytics
- [ ] Mobile app
- [ ] Project dependencies

### Technical Improvements
- [ ] Real-time collaboration with WebSockets
- [ ] Offline support with PWA
- [ ] Advanced caching strategies
- [ ] Performance optimizations
- [ ] Automated testing suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in this README
- Review the Supabase documentation for database-related questions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for team leaders who want simplified project management**
