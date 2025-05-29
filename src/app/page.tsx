import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Shield, CheckCircle, ArrowRight, BarChart3, Zap } from "lucide-react";

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



      {/* Core Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Key Value for Team Leads</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Instant Team Capacity Overview</h4>
              <p className="text-muted-foreground">
                See at a glance who&apos;s overloaded, who has capacity, and where bottlenecks are forming. Color-coded visual indicators make capacity management effortless.
              </p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Effortless Team Management</h4>
              <p className="text-muted-foreground">
                Invite team members, assign them to projects, and track their workload distribution. No more guessing who&apos;s available for new work.
              </p>
            </div>
            <div className="text-center p-6">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Smart Project Planning</h4>
              <p className="text-muted-foreground">
                Plan projects with realistic timelines based on actual team capacity. Avoid overcommitting and ensure successful project delivery.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Team Lead Focus Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Designed for Team Leads</h3>
          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold">Everything You Need as a Team Lead</h4>
                  <p className="text-muted-foreground">Complete control over team capacity and project management</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 text-primary">Capacity Management</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Visual team workload overview
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Color-coded capacity indicators
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Identify overloaded team members
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Spot available capacity instantly
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 text-primary">Project Control</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Create and manage projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Assign team members to projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Set realistic project timelines
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Track project progress
                    </li>
                  </ul>
                </div>
              </div>
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
              <h3 className="text-3xl font-bold mb-6">Why Focus on Capacity?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Prevent Team Burnout</h4>
                    <p className="text-muted-foreground">Identify when team members are overloaded before it becomes a problem</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Optimize Resource Allocation</h4>
                    <p className="text-muted-foreground">See exactly where you have capacity to take on new work or redistribute tasks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Make Data-Driven Decisions</h4>
                    <p className="text-muted-foreground">Base project commitments on actual team capacity, not guesswork</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Improve Project Success</h4>
                    <p className="text-muted-foreground">Set realistic timelines based on team availability and workload</p>
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
          <Link 
            href="/auth" 
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
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
