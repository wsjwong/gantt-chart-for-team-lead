'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { X, Users, Search, Crown, Trash2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  admin_id: string
}

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  created_at: string
  role: 'owner' | 'member' | 'invited'
  projects: Project[]
  projectCount: number
  invitation_status?: 'pending' | 'accepted'
  invited_by?: string
}

interface TeamManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

export default function TeamManagementModal({ isOpen, onClose, currentUserId }: TeamManagementModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [addUserEmail, setAddUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProjects, setUserProjects] = useState<Project[]>([])

  const supabase = createSupabaseClient()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, currentUserId])

  const loadData = async () => {
    setLoading(true)
    await loadUserProjects()
    await loadTeamMembers()

    setLoading(false)
  }

  const loadUserProjects = async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, admin_id')
      .eq('admin_id', currentUserId)

    setUserProjects(projects || [])
  }

  const loadTeamMembers = async () => {
    try {
      // Get current user profile first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single()

      // Get all unique team members from projects where user is admin
      const { data: projectMembersData } = await supabase
        .from('project_members')
        .select(`
          user_id,
          project_id,
          projects!inner(id, name, admin_id),
          profiles!inner(id, email, full_name, created_at, invitation_status, invited_by)
        `)
        .eq('projects.admin_id', currentUserId)

      // Get invited users (now from profiles table)
      const { data: invitedUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('invited_by', currentUserId)
        .eq('invitation_status', 'pending')

      // Group by user and collect their projects
      const memberMap = new Map<string, TeamMember>()

      // Add current user as owner
      if (currentUserProfile) {
        memberMap.set(currentUserId, {
          ...currentUserProfile,
          role: 'owner',
          projects: userProjects,
          projectCount: userProjects.length
        })
      }

      // Add team members
      if (projectMembersData) {
        projectMembersData.forEach((item: any) => {
          const profile = item.profiles
          const project = item.projects

          if (!memberMap.has(profile.id)) {
            memberMap.set(profile.id, {
              ...profile,
              role: profile.invitation_status === 'pending' ? 'invited' : 'member',
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
      }

      // Add invited users as team members
      if (invitedUsers) {
        invitedUsers.forEach((invitedUser) => {
          if (!memberMap.has(invitedUser.id)) {
            memberMap.set(invitedUser.id, {
              id: invitedUser.id,
              email: invitedUser.email,
              full_name: invitedUser.full_name,
              created_at: invitedUser.created_at,
              role: 'invited',
              projects: userProjects,
              projectCount: userProjects.length,
              invitation_status: invitedUser.invitation_status,
              invited_by: invitedUser.invited_by
            })
          }
        })
      }

      setTeamMembers(Array.from(memberMap.values()))
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([])
    }
  }



  const addUserByEmail = async () => {
    if (!addUserEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    const email = addUserEmail.trim().toLowerCase()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    try {
      // Check if user is already a team member
      if (teamMembers.find(member => member.email === email)) {
        alert('User is already a team member')
        return
      }

      // Try to find existing user by email
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (user && user.invitation_status === 'accepted') {
        // User exists and has accepted, add them to projects
        const insertData = userProjects.map(project => ({
          project_id: project.id,
          user_id: user.id
        }))

        if (insertData.length > 0) {
          const { error } = await supabase
            .from('project_members')
            .insert(insertData)

          if (error) {
            console.error('Error adding team member:', error)
            alert('Error adding team member')
            return
          }
        }
      } else {
        // User doesn't exist or is pending, create invited user in profiles table
        const { error: inviteError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            invitation_status: 'pending',
            invited_by: currentUserId,
            invited_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (inviteError) {
          console.error('Error inviting user:', inviteError)
          alert('Error inviting user. They may already be invited.')
          return
        }

        alert(`Invitation sent to ${email}. They will be added to your projects when they sign up.`)
      }

      setAddUserEmail('')
      await loadTeamMembers()
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user')
    }
  }

  const removeMember = async (memberId: string) => {
    if (memberId === currentUserId) {
      alert('You cannot remove yourself')
      return
    }

    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    if (confirm('Are you sure you want to remove this member from all your projects?')) {
      if (member.role === 'invited' && member.invitation_status === 'pending') {
        // Remove invited user from profiles table
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', memberId)
          .eq('invitation_status', 'pending')

        if (error) {
          console.error('Error removing invited user:', error)
          alert('Error removing invited user')
          return
        }
      } else {
        // Remove from project_members table
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
      }

      await loadTeamMembers()
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Manage Team</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add people input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Add people by email"
                value={addUserEmail}
                onChange={(e) => setAddUserEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUserByEmail()}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-sm"
              />
            </div>
            <button
              onClick={addUserByEmail}
              disabled={!addUserEmail.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* People with access */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">People with access</h3>
            
            {/* Search */}
            {teamMembers.length > 3 && (
              <div className="relative mb-3">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-sm"
                />
              </div>
            )}
          </div>

          {/* Team members list */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Users className="h-8 w-8 text-muted-foreground animate-pulse" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No team members found</p>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 py-2 hover:bg-accent rounded-lg px-2">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${member.role === 'invited' ? 'bg-orange-500' : 'bg-green-500'}`}>
                      {(member.full_name || member.email).charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.full_name || 'No Name'}
                          {member.id === currentUserId && ' (you)'}
                        </p>
                        {member.role === 'owner' && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      {member.projectCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {member.projectCount} project{member.projectCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Role/Actions */}
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' ? (
                        <span className="text-xs text-muted-foreground font-medium">Owner</span>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${member.role === 'invited' ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {member.role === 'invited' ? 'Invited' : 'Member'}
                          </span>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
