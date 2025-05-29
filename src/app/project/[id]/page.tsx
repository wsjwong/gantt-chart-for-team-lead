'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  admin_id: string
  created_at: string
}

interface Task {
  id: string
  project_id: string
  name: string
  description: string | null
  assigned_to: string | null
  start_date: string
  end_date: string
  progress: number
  status: 'not_started' | 'in_progress' | 'completed'
  dependencies: string[] | null
  created_at: string
  updated_at: string
  assignee?: {
    full_name: string | null
    email: string
  }
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    status: 'not_started' as const
  })

  useEffect(() => {
    const loadProjectData = async () => {
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

      // Get project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!projectData) {
        router.push('/dashboard')
        return
      }

      // Check if user has access to this project (admin or member)
      const isAdmin = projectData.admin_id === user.id
      let isMember = false
      
      if (!isAdmin) {
        const { data: memberData } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', params.id)
          .eq('user_id', user.id)
          .single()

        isMember = !!memberData
      }
      
      if (!isAdmin && !isMember) {
        router.push('/dashboard')
        return
      }

      setProject(projectData)
      await loadTasks()
      await loadTeamMembers()
      setLoading(false)
    }

    loadProjectData()
  }, [params.id, router, supabase])

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey (
          full_name,
          email
        )
      `)
      .eq('project_id', params.id)
      .order('start_date', { ascending: true })

    setTasks(data || [])
  }

  const loadTeamMembers = async () => {
    const { data } = await supabase
      .from('project_members')
      .select(`
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('project_id', params.id)

    const members = data?.map(item => item.profiles).filter(Boolean) || []
    setTeamMembers(members.flat() as TeamMember[])
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    const { error } = await supabase
      .from('tasks')
      .insert({
        project_id: project.id,
        name: taskForm.name,
        description: taskForm.description,
        assigned_to: taskForm.assigned_to || null,
        start_date: taskForm.start_date,
        end_date: taskForm.end_date,
        status: taskForm.status,
        progress: 0
      })

    if (error) {
      console.error('Error creating task:', error)
      return
    }

    await loadTasks()
    setTaskForm({
      name: '',
      description: '',
      assigned_to: '',
      start_date: '',
      end_date: '',
      status: 'not_started'
    })
    setShowCreateTask(false)
  }

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

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

    // Add to project
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
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

  const updateTaskProgress = async (taskId: string, progress: number, status: string) => {
    const isProjectAdmin = project?.admin_id === profile?.id
    
    if (!isProjectAdmin) {
      // Non-admins can only update their own tasks
      const task = tasks.find(t => t.id === taskId)
      if (task?.assigned_to !== profile?.id) {
        alert('You can only update your own tasks')
        return
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ progress, status })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    await loadTasks()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'in_progress': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const isProjectAdmin = () => {
    return project?.admin_id === profile?.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading project...</p>
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
                  <h1 className="text-2xl font-bold text-foreground">{project?.name}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isProjectAdmin()
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary-foreground'
                  }`}>
                    {isProjectAdmin() ? 'Admin' : 'Member'}
                  </span>
                </div>
                {project?.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isProjectAdmin() && (
                <>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 border border-border text-foreground px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Team Members */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Team Members ({teamMembers.length})</h3>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-card px-3 py-2 rounded-lg border border-border">
                <span className="text-sm font-medium">{member.full_name || member.email}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tasks ({tasks.length})</h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-2">No Tasks Yet</h4>
              <p className="text-muted-foreground mb-6">
                {isProjectAdmin()
                  ? 'Create your first task to start planning your project' 
                  : 'No tasks have been assigned yet'
                }
              </p>
              {isProjectAdmin() && (
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{task.name}</h4>
                      {task.description && (
                        <p className="text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium capitalize">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Assigned To</label>
                      <p className="text-sm font-medium">
                        {task.assignee?.full_name || task.assignee?.email || 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <p className="text-sm font-medium">{new Date(task.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Date</label>
                      <p className="text-sm font-medium">{new Date(task.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Progress</label>
                      <p className="text-sm font-medium">{task.progress}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Update Progress (only for assigned tasks or admins) */}
                  {(isProjectAdmin() || task.assigned_to === profile?.id) && (
                    <div className="flex items-center space-x-4">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          const newProgress = newStatus === 'completed' ? 100 : 
                                            newStatus === 'in_progress' ? Math.max(task.progress, 1) : 0
                          updateTaskProgress(task.id, newProgress, newStatus)
                        }}
                        className="px-3 py-1 bg-input border border-border rounded text-sm"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => {
                          const newProgress = parseInt(e.target.value)
                          const newStatus = newProgress === 100 ? 'completed' : 
                                          newProgress > 0 ? 'in_progress' : 'not_started'
                          updateTaskProgress(task.id, newProgress, newStatus)
                        }}
                        className="flex-1"
                      />
                      
                      <span className="text-sm text-muted-foreground w-12">{task.progress}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Task Name</label>
                <input
                  type="text"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter task name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assign To</label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({...taskForm, assigned_to: e.target.value})}
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
                    value={taskForm.start_date}
                    onChange={(e) => setTaskForm({...taskForm, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={taskForm.end_date}
                    onChange={(e) => setTaskForm({...taskForm, end_date: e.target.value})}
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
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
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
                  The user must already have an account to be added to the project.
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
