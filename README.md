# Gantt Chart for Team Leader

A modern SaaS application for project management with Gantt chart functionality, built with Next.js, Tailwind CSS, and Supabase. This tool is specifically designed for team leaders to manage their projects with simple project-based timelines, replacing complex task management with streamlined project tracking.

## Features

### 🎯 Core Functionality
- **Dark Theme UI** - Modern, professional dark interface
- **Direct Project Management** - Each team leader manages their own projects directly
- **Team Member Management** - Add team members to projects
- **Project Timeline Tracking** - Visual project timelines with start and end dates
- **Progress Tracking** - Automatic progress calculation based on project timeline
- **Project Gantt Chart** - Visual timeline showing all project schedules
- **Simple Project Planning** - Focus on project-level planning without complex task breakdown

### 👥 User Roles

#### Team Leader (Project Admin)
- Full access to all project features
- Create and manage projects with start/end dates
- Add/remove team members to projects
- Edit project details and timelines
- View project Gantt chart

#### Team Member
- View projects they are assigned to
- View project timeline and team members
- Cannot create projects or manage other users

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

The application uses a simplified database schema focused on project-level management:

### `profiles`
- User profiles with role-based access
- Links to Supabase auth.users
- Stores user information

### `projects`
- Project information with start and end dates
- Owned by team leader users
- Contains project name, description, timeline, and timestamps
- **New fields**: `start_date`, `end_date` for project timeline

### `project_members`
- Junction table for project team members
- Links users to projects they belong to
- Enables project collaboration

### Removed Tables
- ~~`tasks`~~ - Removed to simplify project management to project-level only

## Key Features Explained

### Authentication & Authorization
- Secure user registration and login via Supabase Auth
- Role-based access control with Row Level Security (RLS)
- Automatic profile creation on user signup

### Simplified Project Management
- Team leaders create projects with start and end dates
- Each team leader has one implicit team
- Team members are added directly to projects
- Project-level access control ensures data security
- **No task breakdown** - Focus on project-level planning

### Project Timeline Management
- Simple project cards with start/end dates and duration
- Automatic progress calculation based on current date vs project timeline
- Visual progress bars showing project completion percentage
- Project editing with date validation

### Project Gantt Chart
- Visual timeline showing all projects across time
- Week-by-week view with navigation controls
- Project overlap visualization
- Clean, focused view without task complexity

### User Experience
- Responsive design works on desktop and mobile
- Dark theme optimized for professional use
- Intuitive navigation and clear visual hierarchy
- Real-time updates across team members

## Development

### Project Structure
```
src/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard with project Gantt chart
│   ├── project/[id]/   # Individual project pages (simplified)
│   ├── globals.css     # Global styles and theme
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── lib/
│   └── supabase.ts     # Supabase client and types
└── components/         # Reusable components (future)
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

If you're upgrading from a previous version with task management, run the SQL migration:

```sql
-- Run the commands in database_migration.sql to:
-- 1. Add start_date and end_date columns to projects table
-- 2. Remove the tasks table
-- 3. Set up proper constraints
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

## Simplified Architecture

This application follows a simplified architecture where:
- Each team leader manages projects directly (no separate team entity)
- Projects have start and end dates instead of complex task breakdowns
- Team members are added to specific projects
- The dashboard shows a unified Gantt chart of all projects
- Progress is calculated automatically based on project timeline
- **Focus on project-level planning** rather than detailed task management

This approach reduces complexity while maintaining essential functionality for effective high-level project management.

## Why Simplified?

This version removes task management complexity to focus on:
- **Project-level planning** - Better for high-level project oversight
- **Simplified timeline management** - Just start and end dates
- **Reduced cognitive load** - Fewer entities to manage
- **Faster setup** - Projects can be created and tracked immediately
- **Better for team leaders** - Focus on project outcomes rather than micro-management

Perfect for team leaders who need project visibility without the overhead of detailed task tracking.

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
