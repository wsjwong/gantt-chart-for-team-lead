'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, Users, Calendar, ChevronLeft, ChevronRight, FolderPlus, Edit, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import TeamManagementModal from '@/components/TeamManagementModal'

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface Project {
  id: string
  name: string
  admin_id: string
  start_date: string
  end_date: string
  created_at: string
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)

  
  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    assigned_to: ''
  })

  // Edit project state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditProject, setShowEditProject] = useState(false)

  const router = useRouter()
  const supabase = createSupabaseClient()

  // Generate weeks for the timeline
  const generateWeeks = (startDate: Date, numWeeks: number = 16) => {
    const weeks = []
    const current = new Date(startDate)
    current.setDate(current.getDate() - current.getDay()) // Start from Sunday
    
    for (let i = 0; i < numWeeks; i++) {
      weeks.push(new Date(current))
      current.setDate(current.getDate() + 7)
    }
    return weeks
  }

  const weeks = generateWeeks(currentDate)

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          router.push('/auth')
          return
        }
        
        if (!user) {
          console.log('No user found, redirecting to auth')
          router.push('/auth')
          return
        }

        console.log('User found:', { id: user.id, email: user.email })

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error getting profile:', profileError)
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile')
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || null
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Error creating profile:', createError)
            } else {
              console.log('Profile created successfully:', newProfile)
              setProfile(newProfile)
              await loadData(newProfile)
            }
          }
        } else if (profileData) {
          console.log('Profile loaded:', profileData)
          setProfile(profileData)
          await loadData(profileData)
        }
      } catch (err) {
        console.error('Unexpected error in getUser:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const loadData = async (userProfile: Profile) => {
    await loadProjects(userProfile)
    await loadTeamMembers(userProfile)
  }

  const loadProjects = async (userProfile: Profile) => {
    try {
      // Get projects user created (as admin) or is a member of
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('admin_id', userProfile.id)
        .order('created_at', { ascending: false })
      
      if (ownedError) {
        console.error('Error loading owned projects:', ownedError)
      }
      
      // Get projects user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          projects!inner(*)
        `)
        .eq('user_id', userProfile.id)
      
      if (memberError) {
        console.error('Error loading member projects:', memberError)
      }
      
      // Combine owned projects and member projects
      const memberProjects = memberData?.map(m => m.projects).filter(Boolean) || []
      const allProjects = [...(ownedProjects || []), ...memberProjects]
      
      // Remove duplicates based on project id
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      )
      
      console.log('Loaded projects:', uniqueProjects)
      setProjects(uniqueProjects)
    } catch (err) {
      console.error('Unexpected error loading projects:', err)
    }
  }

  const loadTeamMembers = async (userProfile: Profile) => {
    try {
      // Get all unique team members from all projects where user is admin
      const { data: projectMembersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          profiles (
            id,
            full_name,
            email
          )
        `)
        .in('project_id', projects.filter(p => p.admin_id === userProfile.id).map(p => p.id))

      if (membersError) {
        console.error('Error loading project members:', membersError)
      }

      const members: TeamMember[] = projectMembersData?.map((item: { profiles: TeamMember | TeamMember[] }) => {
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        return profile
      }).filter(Boolean) || []
      
      // Get invited users for projects where user is admin (now from profiles table)
      const { data: invitedUsers, error: invitedError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invited_by', userProfile.id)
        .eq('invitation_status', 'pending')

      if (invitedError) {
        console.error('Error loading invited users:', invitedError)
      }

      // Add invited users as team members (they can be assigned to projects)
      if (invitedUsers) {
        invitedUsers.forEach((invitedUser) => {
          members.push({
            id: invitedUser.id,
            email: invitedUser.email,
            full_name: `${invitedUser.email} (Invited)` // Mark as invited
          })
        })
      }
      
      // Add current user if not already included
      if (!members.find((m: TeamMember) => m.id === userProfile.id)) {
        members.unshift(userProfile as TeamMember)
      }

      // Remove duplicates
      const uniqueMembers = members.filter((member, index, self) => 
        index === self.findIndex(m => m.id === member.id)
      )

      setTeamMembers(uniqueMembers)
    } catch (err) {
      console.error('Unexpected error loading team members:', err)
      setTeamMembers([userProfile as TeamMember])
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      console.error('No profile found')
      return
    }

    if (!projectForm.name.trim() || !projectForm.start_date || !projectForm.end_date) {
      alert('Please fill in all required fields')
      return
    }

    if (new Date(projectForm.end_date) <= new Date(projectForm.start_date)) {
      alert('End date must be after start date')
      return
    }

    try {
      console.log('Creating project with data:', {
        name: projectForm.name,
        admin_id: profile.id,
        start_date: projectForm.start_date,
        end_date: projectForm.end_date,
      })

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectForm.name.trim(),
          admin_id: profile.id,
          start_date: projectForm.start_date,
          end_date: projectForm.end_date,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating project:', error)
        alert(`Error creating project: ${error.message || 'Unknown error'}`)
        return
      }

      if (!data) {
        console.error('No data returned from project creation')
        alert('Error: No data returned from project creation')
        return
      }

      console.log('Project created successfully:', data)
      
      // If a team member was assigned, add them to the project
      if (projectForm.assigned_to) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: data.id,
            user_id: projectForm.assigned_to
          })
        
        if (memberError) {
          console.error('Error adding team member to project:', memberError)
        }
      }
      
      setProjects([data, ...projects])
      setProjectForm({
        name: '',
        start_date: '',
        end_date: '',
        assigned_to: ''
      })
      setShowCreateProject(false)
    } catch (err) {
      console.error('Unexpected error creating project:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigateWeeks = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const handleProjectClick = async (project: Project) => {
    setEditingProject(project)
    
    // Get current assigned team member for this project
    const { data: memberData } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', project.id)
      .limit(1)
      .single()
    
    setProjectForm({
      name: project.name,
      start_date: project.start_date,
      end_date: project.end_date,
      assigned_to: memberData?.user_id || ''
    })
    setShowEditProject(true)
  }

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject || !profile) {
      console.error('No project or profile found')
      return
    }

    if (!projectForm.name.trim() || !projectForm.start_date || !projectForm.end_date) {
      alert('Please fill in all required fields')
      return
    }

    if (new Date(projectForm.end_date) <= new Date(projectForm.start_date)) {
      alert('End date must be after start date')
      return
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: projectForm.name.trim(),
          start_date: projectForm.start_date,
          end_date: projectForm.end_date,
        })
        .eq('id', editingProject.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        alert('Error updating project')
        return
      }

      // Handle team member assignment changes
      // First, remove existing project members
      await supabase
        .from('project_members')
        .delete()
        .eq('project_id', editingProject.id)
      
      // Then add the new assigned member if one was selected
      if (projectForm.assigned_to) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: editingProject.id,
            user_id: projectForm.assigned_to
          })
        
        if (memberError) {
          console.error('Error updating team member assignment:', memberError)
        }
      }

      // Update the projects list
      setProjects(projects.map(p => p.id === editingProject.id ? data : p))
      setShowEditProject(false)
      setEditingProject(null)
      setProjectForm({
        name: '',
        start_date: '',
        end_date: '',
        assigned_to: ''
      })
    } catch (err) {
      console.error('Unexpected error updating project:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const deleteProject = async () => {
    if (!editingProject || !profile) {
      console.error('No project or profile found')
      return
    }

    // Only allow project admin to delete the project
    if (editingProject.admin_id !== profile.id) {
      alert('Only the project admin can delete this project')
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${editingProject.name}"?\n\nThis action cannot be undone and will remove all associated data.`
    )

    if (!confirmDelete) {
      return
    }

    try {
      // First, delete all project members
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', editingProject.id)

      if (membersError) {
        console.error('Error deleting project members:', membersError)
        alert('Error deleting project members')
        return
      }

      // Then delete the project itself
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', editingProject.id)

      if (projectError) {
        console.error('Error deleting project:', projectError)
        alert('Error deleting project')
        return
      }

      // Update the projects list
      setProjects(projects.filter(p => p.id !== editingProject.id))
      setShowEditProject(false)
      setEditingProject(null)
      setProjectForm({
        name: '',
        start_date: '',
        end_date: '',
        assigned_to: ''
      })

      alert('Project deleted successfully')
    } catch (err) {
      console.error('Unexpected error deleting project:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getProjectPosition = (project: Project, weekIndex: number) => {
    const projectStart = new Date(project.start_date)
    const projectEnd = new Date(project.end_date)
    const weekStart = weeks[weekIndex]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Check if project overlaps with this week
    if (projectEnd < weekStart || projectStart > weekEnd) {
      return null
    }

    // Calculate overlap percentage
    const overlapStart = new Date(Math.max(projectStart.getTime(), weekStart.getTime()))
    const overlapEnd = new Date(Math.min(projectEnd.getTime(), weekEnd.getTime()))
    const overlapDays = (overlapEnd.getTime() - overlapStart.getTime()) / (24 * 60 * 60 * 1000) + 1
    const weekDays = 7
    const percentage = Math.min(100, (overlapDays / weekDays) * 100)

    return {
      percentage,
      isStart: projectStart >= weekStart && projectStart <= weekEnd,
      isEnd: projectEnd >= weekStart && projectEnd <= weekEnd,
      project
    }
  }

  const formatWeekHeader = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month}-${String(day).padStart(2, '0')}`
  }

  const calculateProjectDuration = (project: Project) => {
    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your team Gantt chart...</p>
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
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.png" 
                alt="Gantt Chart for Team Leader" 
                width={40} 
                height={40} 
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold">Gantt Chart for Team Leader</h1>
                <p className="text-sm text-muted-foreground">
                  {projects.length} projects • {teamMembers.length} team members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Projects Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center space-x-2 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Manage Team</span>
            </button>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => navigateWeeks('prev')}
              className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium px-3 py-2 bg-accent rounded-lg">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeeks('next')}
              className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gantt Chart */}
        {projects.length > 0 ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <p className="text-sm text-muted-foreground">Click on any project row to view details and manage tasks</p>
            </div>
            
            {/* Header Row */}
            <div className="grid grid-cols-[300px_repeat(12,80px)] gap-0 border-b border-border bg-muted/50">
              <div className="p-3 border-r border-border">
                <span className="text-sm font-medium">Project</span>
              </div>
              {weeks.slice(0, 12).map((week, index) => (
                <div key={index} className="p-2 text-center border-r border-border">
                  <div className="text-xs font-medium">{formatWeekHeader(week)}</div>
                  <div className="text-xs text-muted-foreground">W{getWeekNumber(week)}</div>
                </div>
              ))}
            </div>

            {/* Data Rows */}
            <div className="max-h-[400px] overflow-y-auto">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="grid grid-cols-[300px_repeat(12,80px)] gap-0 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="p-3 border-r border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{project.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {calculateProjectDuration(project)} days
                        </div>
                      </div>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {weeks.slice(0, 12).map((week, weekIndex) => {
                    const position = getProjectPosition(project, weekIndex)
                    
                    return (
                      <div key={weekIndex} className="p-1 border-r border-border">
                        {position && (
                          <div className="h-6 relative">
                            <div 
                              className="h-full rounded bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
                              style={{ width: `${position.percentage}%` }}
                              title={`${project.name}: ${Math.round(position.percentage)}% of week - Click to manage`}
                            >
                              {position.percentage > 50 && (
                                <span className="text-xs text-white font-medium">
                                  {Math.round(position.percentage)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Project Timeline</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Projects Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to see the interactive Gantt chart
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold">Create New Project</h3>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
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
                <label className="block text-sm font-medium text-foreground mb-2">Assign to Team Member</label>
                <select
                  value={projectForm.assigned_to}
                  onChange={(e) => setProjectForm({...projectForm, assigned_to: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({...projectForm, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
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
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold">Edit Project</h3>
              <button
                onClick={() => {
                  setShowEditProject(false)
                  setEditingProject(null)
                  setProjectForm({
                    name: '',
                    start_date: '',
                    end_date: '',
                    assigned_to: ''
                  })
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
            <form onSubmit={updateProject} className="space-y-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Assign to Team Member</label>
                <select
                  value={projectForm.assigned_to}
                  onChange={(e) => setProjectForm({...projectForm, assigned_to: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({...projectForm, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Update Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProject(false)
                    setEditingProject(null)
                    setProjectForm({
                      name: '',
                      start_date: '',
                      end_date: '',
                      assigned_to: ''
                    })
                  }}
                  className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {/* Delete Project Section */}
              {editingProject && profile && editingProject.admin_id === profile.id && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Danger Zone</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete this project</p>
                    </div>
                    <button
                      type="button"
                      onClick={deleteProject}
                      className="flex items-center space-x-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Project</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        currentUserId={profile?.id || ''}
      />
    </div>
  )
}
