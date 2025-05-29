'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Users, Calendar, Settings } from 'lucide-react'
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [showSettings, setShowSettings] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSettings) {
        setShowSettings(null)
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
              await loadTeams(newProfile)
            }
          }
        } else if (profileData) {
          console.log('Profile loaded:', profileData)
          setProfile(profileData)
          await loadTeams(profileData)
        }
      } catch (err) {
        console.error('Unexpected error in getUser:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const loadTeams = async (userProfile: Profile) => {
    try {
      // Get teams user created (as admin)
      const { data: ownedTeams, error: ownedError } = await supabase
        .from('teams')
        .select('*')
        .eq('admin_id', userProfile.id)
        .order('created_at', { ascending: false })
      
      if (ownedError) {
        console.error('Error loading owned teams:', ownedError)
      }
      
      // Get teams user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams!inner(*)
        `)
        .eq('user_id', userProfile.id)
      
      if (memberError) {
        console.error('Error loading member teams:', memberError)
      }
      
      // Combine owned teams and member teams
      const memberTeams = memberData?.map(m => m.teams).filter(Boolean) || []
      const allTeams = [...(ownedTeams || []), ...memberTeams]
      
      // Remove duplicates based on team id
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      )
      
      console.log('Loaded teams:', uniqueTeams)
      setTeams(uniqueTeams)
    } catch (err) {
      console.error('Unexpected error loading teams:', err)
    }
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      console.error('No profile found')
      return
    }

    if (!newTeamName.trim()) {
      console.error('Team name is required')
      return
    }

    try {
      console.log('Creating team with data:', {
        name: newTeamName,
        admin_id: profile.id,
      })

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName.trim(),
          admin_id: profile.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating team:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Error creating team: ${error.message || 'Unknown error'}`)
        return
      }

      if (!data) {
        console.error('No data returned from team creation')
        alert('Error: No data returned from team creation')
        return
      }

      console.log('Team created successfully:', data)
      setTeams([data, ...teams])
      setNewTeamName('')
      setShowCreateTeam(false)
    } catch (err) {
      console.error('Unexpected error creating team:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isTeamAdmin = (team: Team) => {
    return team.admin_id === profile?.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Team Dashboard</h1>
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Teams Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Your Teams
            </h2>
            <p className="text-muted-foreground mt-2">
              Teams you lead or are a member of
            </p>
          </div>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Team</span>
          </button>
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Create New Team</h3>
              <form onSubmit={createTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg font-semibold hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Teams Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first team to start managing projects and tasks
            </p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{team.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isTeamAdmin(team)
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary-foreground'
                      }`}>
                        {isTeamAdmin(team) ? 'Team Leader' : 'Team Member'}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowSettings(showSettings === team.id ? null : team.id)
                      }}
                      className="p-1 rounded hover:bg-accent transition-colors"
                    >
                      <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>
                    
                    {showSettings === team.id && (
                      <div className="absolute right-0 top-8 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <Link
                            href={`/team/${team.id}`}
                            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                            onClick={() => setShowSettings(null)}
                          >
                            View Team
                          </Link>
                          {isTeamAdmin(team) && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setShowSettings(null)
                                  alert('Team settings coming soon!')
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              >
                                Team Settings
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setShowSettings(null)
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    href={`/team/${team.id}`}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Open Team
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
