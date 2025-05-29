'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { X, Users, Search, Crown, Trash2 } from 'lucide-react'

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

interface TeamMember extends Profile {
  role: 'owner' | 'member'
  projects: Project[]
  projectCount: number
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
          profiles!inner(id, email, full_name, created_at)
        `)
        .eq('projects.admin_id', currentUserId)

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
              role: 'member',
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

      if (user) {
        // User exists, add them to projects
      } else {
        // User doesn't exist, add them to invited_users table
        const { error: inviteError } = await supabase
          .from('invited_users')
          .insert({
            email: email,
            invited_by: currentUserId
          })

        if (inviteError) {
          console.error('Error inviting user:', inviteError)
          alert('Error inviting user. They may already be invited.')
          return
        }

        alert(`Invitation sent to ${email}. They will be added to your projects when they sign up.`)
        setAddUserEmail('')
        await loadTeamMembers()
        return
      }

      // Add user to all projects
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Manage Team</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add people input */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Add people by email"
                value={addUserEmail}
                onChange={(e) => setAddUserEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUserByEmail()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={addUserByEmail}
              disabled={!addUserEmail.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* People with access */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">People with access</h3>
            
            {/* Search */}
            {teamMembers.length > 3 && (
              <div className="relative mb-3">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Team members list */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Users className="h-8 w-8 text-gray-400 animate-pulse" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No team members found</p>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-md px-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(member.full_name || member.email).charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.full_name || 'No Name'}
                          {member.id === currentUserId && ' (you)'}
                        </p>
                        {member.role === 'owner' && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      {member.projectCount > 0 && (
                        <p className="text-xs text-gray-400">
                          {member.projectCount} project{member.projectCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Role/Actions */}
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' ? (
                        <span className="text-xs text-gray-500 font-medium">Owner</span>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Member</span>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
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

        {/* General access info */}
        <div className="p-4 bg-blue-50 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Team Access</p>
              <p className="text-xs text-gray-600">
                Team members can view and collaborate on all your projects
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
