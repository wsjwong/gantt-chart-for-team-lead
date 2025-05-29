import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Shield, CheckCircle, ArrowRight, BarChart3, UserPlus, Zap, Database, GitBranch, Palette } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="Gantt Chart for Team Lead" 
              width={40} 
              height={40} 
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold">Gantt Chart for Team Lead</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#tech-stack" className="text-muted-foreground hover:text-foreground transition-colors">
              Tech Stack
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/auth" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Latest: v1.3.1 - Fixed Team Member Assignment Bug
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Team Capacity Monitoring Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A modern SaaS application designed specifically for team leads to monitor team capacity with Gantt chart functionality. 
            Replace complex task management with streamlined team capacity monitoring and project-based tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth" 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#features" 
              className="border border-border text-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Latest Updates & Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-500">v1.3.1 - Bug Fix</span>
              </div>
              <h4 className="font-semibold mb-2">Team Member Assignment Fixed</h4>
              <p className="text-sm text-muted-foreground">Resolved critical issue where team members weren&apos;t appearing in project assignment dropdowns.</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-500">v1.3.0 - Major Feature</span>
              </div>
              <h4 className="font-semibold mb-2">Person-Level Capacity View</h4>
              <p className="text-sm text-muted-foreground">Gantt chart now groups projects by team members with color-coded capacity indicators.</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-500">v1.2.3 - Database Fix</span>
              </div>
              <h4 className="font-semibold mb-2">User Signup Issues Resolved</h4>
              <p className="text-sm text-muted-foreground">Fixed database errors during user registration and improved RLS policies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Core Functionality</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Visual Capacity Monitoring</h4>
              <p className="text-muted-foreground">
                Color-coded capacity bars showing normal (green), high (yellow), and over-capacity (red) workloads with hierarchical project display.
              </p>
            </div>
            <div className="text-center p-6">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Team Invitation System</h4>
              <p className="text-muted-foreground">
                Invite users by email and assign them to projects before they accept. Google-style team management modal with consistent styling.
              </p>
            </div>
            <div className="text-center p-6">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Interactive Gantt Chart</h4>
              <p className="text-muted-foreground">
                Click on any project in the timeline to edit details. Modal-based editing with streamlined project management interface.
              </p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Role-Based Access</h4>
              <p className="text-muted-foreground">
                Team leads have full project control while team members can view assigned projects and tasks with secure RLS policies.
              </p>
            </div>
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Secure Project Deletion</h4>
              <p className="text-muted-foreground">
                Admin-only project deletion with confirmation dialogs and proper cascade cleanup of associated data.
              </p>
            </div>
            <div className="text-center p-6">
              <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Professional Dark Theme</h4>
              <p className="text-muted-foreground">
                Modern, professional dark interface with custom logo integration and consistent design system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Modern Tech Stack</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background p-6 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">⚛️</span>
              </div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <p className="text-sm text-muted-foreground">Next.js 15 + React 19</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">🎨</span>
              </div>
              <h4 className="font-semibold mb-2">Styling</h4>
              <p className="text-sm text-muted-foreground">Tailwind CSS 4</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border text-center">
              <Database className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Backend</h4>
              <p className="text-sm text-muted-foreground">Supabase (PostgreSQL, Auth, RLS)</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border text-center">
              <GitBranch className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">AI Integration</h4>
              <p className="text-sm text-muted-foreground">Supabase MCP Server</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Built with modern technologies for scalability, security, and developer experience.
              Includes AI integration via Supabase MCP Server for enhanced development workflows.
            </p>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Designed for Different Roles</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">Team Lead (Project Admin)</h4>
                  <p className="text-muted-foreground">Full project control</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Create and manage projects with start/end dates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Add/remove team members via modal interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Create tasks and assign to team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Delete projects with admin validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  View team capacity and workload distribution
                </li>
              </ul>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">Team Member</h4>
                  <p className="text-muted-foreground">Focused task view</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  View assigned projects and timelines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  See task details and deadlines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Track task progress and status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Access team member information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Secure, role-based access control
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-lg border border-border text-center">
              <h4 className="text-xl font-semibold mb-4">Starter</h4>
              <div className="text-3xl font-bold mb-2">$9<span className="text-lg text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">Perfect for small teams</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Up to 5 team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  3 active projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Basic Gantt charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Team invitation system
                </li>
              </ul>
              <Link href="/auth" className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors inline-block">
                Get Started
              </Link>
            </div>
            <div className="bg-background p-8 rounded-lg border-2 border-primary text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h4 className="text-xl font-semibold mb-4">Professional</h4>
              <div className="text-3xl font-bold mb-2">$19<span className="text-lg text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">For growing teams</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Up to 15 team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Capacity monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Advanced task management
                </li>
              </ul>
              <Link href="/auth" className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-block">
                Get Started
              </Link>
            </div>
            <div className="bg-background p-8 rounded-lg border border-border text-center">
              <h4 className="text-xl font-semibold mb-4">Enterprise</h4>
              <div className="text-3xl font-bold mb-2">$39<span className="text-lg text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">For large organizations</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited everything
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI integration (MCP Server)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Link href="/auth" className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors inline-block">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why This Approach?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Project-Level Oversight</h4>
                    <p className="text-muted-foreground">Clear project timelines and progress tracking with team capacity monitoring</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Task-Level Granularity</h4>
                    <p className="text-muted-foreground">Optional task breakdown when needed with assignment capabilities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Streamlined Workflow</h4>
                    <p className="text-muted-foreground">Focus on essential features without overwhelming complexity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Date-Based Planning</h4>
                    <p className="text-muted-foreground">Use actual dates for flexible day/week/month timeline views</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <h4 className="text-xl font-semibold mb-4">Perfect for:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Software development teams</li>
                <li>• Marketing campaign planning</li>
                <li>• Product launches</li>
                <li>• Event planning</li>
                <li>• Construction projects</li>
                <li>• Any team-based project with capacity constraints</li>
              </ul>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  &ldquo;Built with ❤️ for team leaders who want simplified project management&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Monitor Your Team Capacity?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join team leads who have simplified their project management with our modern Gantt chart tool. 
            Start with our comprehensive mock data or create your own projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth" 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="https://github.com/your-repo" 
              className="border border-border text-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Gantt Chart for Team Lead. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Modern SaaS application for team capacity monitoring • Built with Next.js 15, Tailwind CSS 4, and Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
