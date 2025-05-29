'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Users, FolderOpen, UserPlus, Settings } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface Team {
  id: string
  name: string
  admin_id: string
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string | null
  admin_id: string
  team_id: string
  created_at: string
  task_count?: number
  completed_tasks?: number
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export default function TeamPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  
  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  })

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSettings) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showSettings])

  useEffect(() => {
    const loadTeamData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        router.push('/auth')
        return
      }

      setProfile(profileData)

      // Get team
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!teamData) {
        router.push('/dashboard')
        return
      }

      // Check if user has access to this team (admin or member)
      const isAdmin = teamData.admin_id === user.id
      let isMember = false
      
      if (!isAdmin) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', params.id)
          .eq('user_id', user.id)
          .single()

        isMember = !!memberData
      }
      
      if (!isAdmin && !isMember) {
        router.push('/dashboard')
        return
      }

      setTeam(teamData)
      await loadProjects()
      await loadTeamMembers()
      setLoading(false)
    }

    loadTeamData()
  }, [params.id, router, supabase])

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('team_id', params.id)
      .order('created_at', { ascending: false })

    if (data) {
      // Get task counts for each project
      const projectsWithCounts = await Promise.all(
        data.map(async (project) => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('project_id', project.id)

          const taskCount = tasks?.length || 0
          const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0

          return {
            ...project,
            task_count: taskCount,
            completed_tasks: completedTasks
          }
        })
      )

      setProjects(projectsWithCounts)
    }
  }

  const loadTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select(`
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('team_id', params.id)

    const members: TeamMember[] = data?.map((item: { profiles: TeamMember | TeamMember[] }) => {
      // Handle both single profile and array of profiles
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      return profile
    }).filter(Boolean) || []
    
    // Add team admin to the list if not already included
    if (team?.admin_id) {
      const { data: adminData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', team.admin_id)
        .single()

      if (adminData && !members.find((m: TeamMember) => m.id === adminData.id)) {
        members.unshift(adminData as TeamMember)
      }
    }

    setTeamMembers(members)
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team || !profile) return

    const { error } = await supabase
      .from('projects')
      .insert({
        team_id: team.id,
        name: projectForm.name,
        description: projectForm.description,
        admin_id: profile.id
      })

    if (error) {
      console.error('Error creating project:', error)
      return
    }

    await loadProjects()
    setProjectForm({
      name: '',
      description: ''
    })
    setShowCreateProject(false)
  }

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!team) return

    // Find user by email
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', newMemberEmail)
      .single()

    if (!userData) {
      alert('User not found with this email')
      return
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id)
      .eq('user_id', userData.id)
      .single()

    if (existingMember) {
      alert('User is already a member of this team')
      return
    }

    // Add to team
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userData.id
      })

    if (error) {
      console.error('Error adding team member:', error)
      return
    }

    await loadTeamMembers()
    setNewMemberEmail('')
    setShowAddMember(false)
  }

  const isTeamAdmin = () => {
    return team?.admin_id === profile?.id
  }

  const getProjectProgress = (project: Project) => {
    if (!project.task_count || project.task_count === 0) return 0
    return Math.round((project.completed_tasks || 0) / project.task_count * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">{team?.name}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isTeamAdmin()
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary-foreground'
                  }`}>
                    {isTeamAdmin() ? 'Admin' : 'Member'}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {projects.length} projects • {teamMembers.length} members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isTeamAdmin() && (
                <>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 border border-border text-foreground px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Project</span>
                  </button>
                </>
              )}
              
              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 border border-border text-foreground px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowSettings(false)
                          // Add team settings functionality here
                          alert('Team settings coming soon!')
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        Team Settings
                      </button>
                      {isTeamAdmin() && (
                        <>
                          <button
                            onClick={() => {
                              setShowSettings(false)
                              setShowAddMember(true)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          >
                            Manage Members
                          </button>
                          <button
                            onClick={() => {
                              setShowSettings(false)
                              // Add delete team functionality here
                              if (confirm('Are you sure you want to delete this team? This action cannot be undone.'))
                                alert('Delete team functionality coming soon!')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete Team
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Team Members */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members ({teamMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {(member.full_name || member.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.id === team?.admin_id && (
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Projects ({projects.length})
          </h3>
          
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h4>
              <p className="text-muted-foreground mb-6">
                {isTeamAdmin()
                  ? 'Create your first project to start organizing your team\'s work' 
                  : 'No projects have been created yet'
                }
              </p>
              {isTeamAdmin() && (
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h4>
                      {project.description && (
                        <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <FolderOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{getProjectProgress(project)}%</span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${getProjectProgress(project)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{project.task_count || 0} tasks</span>
                      <span>{project.completed_tasks || 0} completed</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Project</h3>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
            <form onSubmit={addTeamMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter team member's email"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The user must already have an account to be added to the team.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
