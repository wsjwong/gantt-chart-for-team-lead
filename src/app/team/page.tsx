'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Mail, UserPlus, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

interface Project {
  id: string
  name: string
  admin_id: string
}

interface TeamMemberWithProjects extends Profile {
  projects: Project[]
  projectCount: number
}

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithProjects[]>([])
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userProjects, setUserProjects] = useState<Project[]>([])

  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const loadData = async () => {
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
      await loadUserProjects(user.id)
      await loadTeamMembers(user.id)
      await loadAllUsers()
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const loadUserProjects = async (userId: string) => {
    // Get projects where user is admin
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, admin_id')
      .eq('admin_id', userId)

    setUserProjects(projects || [])
  }

  const loadTeamMembers = async (userId: string) => {
    try {
      // Get all unique team members from projects where user is admin
      const { data: projectMembersData } = await supabase
        .from('project_members')
        .select(`
          user_id,
          project_id,
          projects!inner(id, name, admin_id),
          profiles!inner(id, email, full_name, created_at)
        `)
        .eq('projects.admin_id', userId)

      if (!projectMembersData) {
        setTeamMembers([])
        return
      }

      // Group by user and collect their projects
      const memberMap = new Map<string, TeamMemberWithProjects>()

      projectMembersData.forEach((item: any) => {
        const profile = item.profiles
        const project = item.projects

        if (!memberMap.has(profile.id)) {
          memberMap.set(profile.id, {
            ...profile,
            projects: [],
            projectCount: 0
          })
        }

        const member = memberMap.get(profile.id)!
        if (!member.projects.find(p => p.id === project.id)) {
          member.projects.push(project)
          member.projectCount = member.projects.length
        }
      })

      setTeamMembers(Array.from(memberMap.values()))
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([])
    }
  }

  const loadAllUsers = async () => {
    // Get all users for the add member functionality
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    setAllUsers(users || [])
  }

  const addMembersToProjects = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    try {
      // Add selected users to all user's projects
      const insertData = []
      for (const userId of selectedUsers) {
        for (const project of userProjects) {
          // Check if user is already a member
          const { data: existingMember } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', userId)
            .single()

          if (!existingMember) {
            insertData.push({
              project_id: project.id,
              user_id: userId
            })
          }
        }
      }

      if (insertData.length > 0) {
        const { error } = await supabase
          .from('project_members')
          .insert(insertData)

        if (error) {
          console.error('Error adding team members:', error)
          alert('Error adding team members')
          return
        }
      }

      await loadTeamMembers(profile!.id)
      setSelectedUsers([])
      setShowAddMember(false)
    } catch (error) {
      console.error('Error adding team members:', error)
      alert('Error adding team members')
    }
  }

  const removeMemberFromAllProjects = async (memberId: string) => {
    if (!profile) return

    if (confirm('Are you sure you want to remove this member from all your projects?')) {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('user_id', memberId)
        .in('project_id', userProjects.map(p => p.id))

      if (error) {
        console.error('Error removing team member:', error)
        alert('Error removing team member')
        return
      }

      await loadTeamMembers(profile.id)
    }
  }

  const filteredTeamMembers = teamMembers.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableUsers = allUsers.filter(user => 
    user.id !== profile?.id && 
    !teamMembers.find(member => member.id === user.id)
  )

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading team members...</p>
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
                <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
                <p className="text-muted-foreground">Manage your team members across all projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Team Members</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Total Members:</span>
              <span className="font-semibold">{teamMembers.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Your Projects:</span>
              <span className="font-semibold">{userProjects.length}</span>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        {filteredTeamMembers.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {teamMembers.length === 0 ? 'No Team Members Yet' : 'No Members Found'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {teamMembers.length === 0 
                ? 'Add team members to start collaborating on projects'
                : 'Try adjusting your search terms'
              }
            </p>
            {teamMembers.length === 0 && (
              <button
                onClick={() => setShowAddMember(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Your First Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeamMembers.map((member) => (
              <div key={member.id} className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {member.full_name || 'No Name'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMemberFromAllProjects(member.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projects:</span>
                    <span className="font-medium">{member.projectCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">
                      {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {member.projects.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Active in:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {member.projects.slice(0, 3).map((project) => (
                          <span
                            key={project.id}
                            className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                          >
                            {project.name}
                          </span>
                        ))}
                        {member.projects.length > 3 && (
                          <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                            +{member.projects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">Add Team Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select users to add to all your projects ({userProjects.length} projects)
            </p>
            
            <div className="relative mb-4">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              {filteredAvailableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No available users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user.id)
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        )
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => {}}
                        className="rounded border-border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name || 'No Name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {selectedUsers.length} user(s) selected
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddMember(false)
                    setSelectedUsers([])
                    setSearchTerm('')
                  }}
                  className="border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMembersToProjects}
                  disabled={selectedUsers.length === 0}
                  className="bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
