'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Users, Calendar, Edit, Save, X, Plus, CheckCircle, Clock, AlertCircle, Pause } from 'lucide-react'
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
  start_date: string
  end_date: string
  created_at: string
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
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
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  dependencies: string[] | null
  created_at: string
  updated_at: string
  assigned_user?: TeamMember
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEditProject, setShowEditProject] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  
  // Project edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  })

  // Task form state
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'blocked'
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
      setEditForm({
        name: projectData.name,
        description: projectData.description || '',
        start_date: projectData.start_date,
        end_date: projectData.end_date
      })
      
      await loadTeamMembers()
      await loadTasks()
      setLoading(false)
    }

    loadProjectData()
  }, [params.id, router, supabase])

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

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:profiles(id, full_name, email)
      `)
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    setTasks(data || [])
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

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !profile) return

    if (!editForm.name.trim() || !editForm.start_date || !editForm.end_date) {
      alert('Please fill in all required fields')
      return
    }

    if (new Date(editForm.end_date) <= new Date(editForm.start_date)) {
      alert('End date must be after start date')
      return
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
      })
      .eq('id', project.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      alert('Error updating project')
      return
    }

    setProject(data)
    setShowEditProject(false)
  }

  const removeTeamMember = async (memberId: string) => {
    if (!project) return
    
    if (confirm('Are you sure you want to remove this team member?')) {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project.id)
        .eq('user_id', memberId)

      if (error) {
        console.error('Error removing team member:', error)
        return
      }

      await loadTeamMembers()
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    if (!taskForm.name.trim() || !taskForm.start_date || !taskForm.end_date) {
      alert('Please fill in all required fields')
      return
    }

    if (new Date(taskForm.end_date) <= new Date(taskForm.start_date)) {
      alert('End date must be after start date')
      return
    }

    const { error } = await supabase
      .from('tasks')
      .insert({
        project_id: project.id,
        name: taskForm.name.trim(),
        description: taskForm.description.trim() || null,
        assigned_to: taskForm.assigned_to || null,
        start_date: taskForm.start_date,
        end_date: taskForm.end_date,
        status: taskForm.status,
        progress: 0
      })

    if (error) {
      console.error('Error creating task:', error)
      alert('Error creating task')
      return
    }

    await loadTasks()
    setTaskForm({
      name: '',
      description: '',
      assigned_to: '',
      start_date: '',
      end_date: '',
      status: 'pending'
    })
    setShowCreateTask(false)
  }

  const isProjectAdmin = () => {
    return project?.admin_id === profile?.id
  }

  const calculateProjectDuration = () => {
    if (!project) return 0
    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProjectProgress = () => {
    if (!project) return 0
    const start = new Date(project.start_date)
    const end = new Date(project.end_date)
    const now = new Date()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / totalDuration) * 100)
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
                    onClick={() => setShowEditProject(true)}
                    className="flex items-center space-x-2 border border-border text-foreground px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Project</span>
                  </button>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Project Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Project Info */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Project Name</label>
                <p className="text-lg font-medium">{project?.name}</p>
              </div>
              {project?.description && (
                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <p className="text-foreground">{project.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <p className="font-medium">{project ? new Date(project.start_date).toLocaleDateString() : ''}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <p className="font-medium">{project ? new Date(project.end_date).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium">{calculateProjectDuration()} days</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Progress</label>
                  <p className="font-medium">{getProjectProgress()}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{getProjectProgress()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${getProjectProgress()}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Started: {project ? new Date(project.start_date).toLocaleDateString() : ''}</p>
                <p>Expected completion: {project ? new Date(project.end_date).toLocaleDateString() : ''}</p>
                <p>Created: {project ? new Date(project.created_at).toLocaleDateString() : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Team Members ({teamMembers.length})</h3>
            {isProjectAdmin() && (
              <button
                onClick={() => setShowAddMember(true)}
                className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
              >
                Add Member
              </button>
            )}
          </div>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No team members yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{member.full_name || member.email}</p>
                    {member.full_name && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                  {isProjectAdmin() && member.id !== profile?.id && (
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
            {isProjectAdmin() && (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Task</span>
              </button>
            )}
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No tasks yet</p>
              {isProjectAdmin() && (
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-muted/50 p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'in_progress' ? (
                          <><Clock className="h-3 w-3 inline mr-1" />In Progress</>
                        ) : task.status === 'completed' ? (
                          <><CheckCircle className="h-3 w-3 inline mr-1" />Completed</>
                        ) : task.status === 'blocked' ? (
                          <><AlertCircle className="h-3 w-3 inline mr-1" />Blocked</>
                        ) : (
                          <><Pause className="h-3 w-3 inline mr-1" />Pending</>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Assigned to:</span>
                      <p className="font-medium">
                        {task.assigned_user ? 
                          (task.assigned_user.full_name || task.assigned_user.email) : 
                          'Unassigned'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{new Date(task.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">{new Date(task.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="font-medium text-xs">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Project</h3>
            <form onSubmit={updateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({...editForm, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({...editForm, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProject(false)}
                  className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
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
                <label className="block text-sm font-medium text-foreground mb-2">Assign to Team Member</label>
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'blocked'})}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTask(false)
                    setTaskForm({
                      name: '',
                      description: '',
                      assigned_to: '',
                      start_date: '',
                      end_date: '',
                      status: 'pending'
                    })
                  }}
                  className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
