# Gantt Chart for Team Leader

A modern SaaS application for project management with Gantt chart functionality, built with Next.js, Tailwind CSS, and Supabase. This tool is specifically designed for team leaders to manage their projects with simple project-based timelines, replacing complex task management with streamlined project tracking.

## Features

### 🎯 Core Functionality
- **Professional Branding** - Custom logo integration with modern visual identity
- **Dark Theme UI** - Modern, professional dark interface
- **Direct Project Management** - Each team leader manages their own projects directly
- **Team Member Management** - Add/remove team members to/from projects with consistent Google-style team management modal
- **Project Assignment** - Assign team members to projects during creation and editing
- **Modal-based Editing** - Streamlined project editing through interactive modals instead of separate pages
- **Interactive Gantt Chart** - Click on any project in the timeline to edit details and manage assignments
- **Project Deletion** - Secure project deletion with admin-only access and confirmation dialogs
- **Project Timeline Tracking** - Visual project timelines with start and end dates
- **Date-based Planning** - Use actual dates instead of week numbers for flexible day/week/month views

### 👥 User Roles

#### Team Leader (Project Admin)
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

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

The application uses a comprehensive database schema for project and task management:

### `profiles`
- User profiles with role-based access
- Links to Supabase auth.users
- Stores user information (full_name, email)

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
- Task creation and assignment to specific team members
- Project-level and task-level progress tracking
- **Secure project deletion** with admin validation and cascade cleanup

### Task Management
- Create tasks within projects with detailed information
- Assign tasks to specific team members
- Track task progress with status updates (pending, in progress, completed, blocked)
- Task timeline management with start and end dates
- Visual task progress indicators

### Project Timeline Management
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
-- 1. Create profiles table with user information
-- 2. Create projects table with timeline fields
-- 3. Create project_members junction table
-- 4. Create tasks table with assignment and progress tracking
-- 5. Set up Row Level Security (RLS) policies
-- 6. Create proper foreign key relationships
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
