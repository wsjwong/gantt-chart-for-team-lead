# Gantt Chart for Team Leader

A modern SaaS application for project management with Gantt chart functionality, built with Next.js, Tailwind CSS, and Supabase. This tool simplifies project planning and replaces fragile Google Sheets with a robust, role-based project management system.

## Features

### 🎯 Core Functionality
- **Dark Theme UI** - Modern, professional dark interface
- **Role-Based Access Control** - Admin and Team Member roles with appropriate permissions
- **Project Management** - Create and manage multiple projects
- **Task Assignment** - Assign tasks to team members with timeline management
- **Progress Tracking** - Visual progress indicators and status updates
- **Team Collaboration** - Add team members to projects and manage permissions

### 👥 User Roles

#### Admin
- Full access to all project features
- Create and manage projects
- Add/remove team members
- Assign tasks to any team member
- View and edit all tasks
- Manage project settings

#### Team Member
- View assigned projects
- Update progress on assigned tasks only
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
3. In the Supabase SQL Editor, run the schema from `supabase-schema.sql`
4. Enable email authentication in Authentication > Settings

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

The application uses the following main tables:

### `profiles`
- User profiles with role-based access
- Links to Supabase auth.users
- Stores user role (admin/team_member)

### `projects`
- Project information and metadata
- Owned by admin users
- Contains project name, description, and timestamps

### `project_members`
- Junction table for project team members
- Links users to projects they can access
- Enables team collaboration

### `tasks`
- Individual tasks within projects
- Assignable to team members
- Includes timeline, progress, and status tracking
- Supports task dependencies (future enhancement)

## Key Features Explained

### Authentication & Authorization
- Secure user registration and login via Supabase Auth
- Role-based access control with Row Level Security (RLS)
- Automatic profile creation on user signup

### Project Management
- Admins can create unlimited projects
- Team members are added via email invitation
- Project-level access control ensures data security

### Task Management
- Visual task cards with progress indicators
- Timeline management with start/end dates
- Status tracking (Not Started, In Progress, Completed)
- Progress percentage with visual slider controls

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
│   ├── dashboard/      # Main dashboard
│   ├── project/[id]/   # Individual project pages
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

## Future Enhancements

### Planned Features
- [ ] Visual Gantt chart with drag-and-drop
- [ ] Task dependencies and critical path
- [ ] File attachments and comments
- [ ] Email notifications
- [ ] Project templates
- [ ] Time tracking
- [ ] Reporting and analytics
- [ ] Mobile app

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

**Built with ❤️ for team leaders who want to simplify project management**
