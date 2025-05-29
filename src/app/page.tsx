import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Shield, CheckCircle, ArrowRight } from "lucide-react";

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
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Simplify Project Planning
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Replace fragile Google Sheets with a powerful Gantt chart tool designed for team leads. 
            Assign tasks, track progress, and keep your team aligned.
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
              href="#demo" 
              className="border border-border text-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Our Gantt Chart Tool?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Timeline Management</h4>
              <p className="text-muted-foreground">
                Visualize project timelines with intuitive drag-and-drop functionality. 
                Easily adjust dates and dependencies.
              </p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Team Collaboration</h4>
              <p className="text-muted-foreground">
                Assign tasks to team members who can log in to view and update their own assignments. 
                Keep everyone on the same page.
              </p>
            </div>
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Role-Based Access</h4>
              <p className="text-muted-foreground">
                Admins have full control while team members can only access their assigned tasks. 
                Secure and organized.
              </p>
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
                  Advanced features
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
              <h3 className="text-3xl font-bold mb-6">Replace Your Fragile Spreadsheets</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">No More Version Conflicts</h4>
                    <p className="text-muted-foreground">Real-time updates ensure everyone sees the latest information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Automated Task Dependencies</h4>
                    <p className="text-muted-foreground">Visual connections between tasks that update automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Team Member Access Control</h4>
                    <p className="text-muted-foreground">Each team member sees only what they need to see</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Progress Tracking</h4>
                    <p className="text-muted-foreground">Visual progress indicators and completion status</p>
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
                <li>• Any team-based project</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of team leads who have simplified their project management with our Gantt chart tool.
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
        </div>
      </footer>
    </div>
  );
}
