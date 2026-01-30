import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & { match_sets: MatchSet[] }

type MonthlyData = {
  month: string
  wins: number
  losses: number
}

interface UserState {
  // State
  profile: Profile | null
  matches: MatchWithSets[]
  isGuest: boolean
  isLoading: boolean
  isInitialized: boolean

  // Computed
  stats: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    streak: number
    longestStreak: number
    monthlyData: MonthlyData[]
  }

  // Actions
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshMatches: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => void
  addMatch: (match: MatchWithSets) => void
  removeMatch: (matchId: string) => void
  reset: () => void
}

const initialStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  streak: 0,
  longestStreak: 0,
  monthlyData: [] as MonthlyData[],
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  profile: null,
  matches: [],
  isGuest: false,
  isLoading: true,
  isInitialized: false,
  stats: initialStats,

  // Initialize user data (call once on app load)
  initialize: async () => {
    const { isInitialized } = get()
    if (isInitialized) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true })
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ isGuest: true, isLoading: false, isInitialized: true })
        return
      }

      // Fetch profile
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Auto-generate username if not set
      if (profileData && !profileData.username && user.email) {
        const generatedUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ username: generatedUsername })
          .eq('id', user.id)
          .select()
          .single()

        if (updatedProfile) {
          profileData = updatedProfile
        }
      }

      // Fetch ALL matches (no limit for accurate stats)
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, match_sets(*)')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      const matches = (matchesData || []) as MatchWithSets[]

      // Calculate stats
      const stats = calculateStats(matches)

      set({
        profile: profileData,
        matches,
        stats,
        isGuest: false,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      console.error('Failed to initialize user:', error)
      set({ isLoading: false, isInitialized: true })
    }
  },

  // Refresh profile only
  refreshProfile: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      set({ profile: profileData })
    }
  },

  // Refresh matches only
  refreshMatches: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*, match_sets(*)')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })

    const matches = (matchesData || []) as MatchWithSets[]
    const stats = calculateStats(matches)

    set({ matches, stats })
  },

  // Update profile locally (after successful API update)
  updateProfile: (data) => {
    const { profile } = get()
    if (profile) {
      set({ profile: { ...profile, ...data } })
    }
  },

  // Add match locally
  addMatch: (match) => {
    const { matches } = get()
    const newMatches = [match, ...matches].slice(0, 10)
    const stats = calculateStats(newMatches)
    set({ matches: newMatches, stats })
  },

  // Remove match locally
  removeMatch: (matchId) => {
    const { matches } = get()
    const newMatches = matches.filter(m => m.id !== matchId)
    const stats = calculateStats(newMatches)
    set({ matches: newMatches, stats })
  },

  // Reset store (on logout)
  reset: () => {
    set({
      profile: null,
      matches: [],
      isGuest: false,
      isLoading: false,
      isInitialized: false,
      stats: initialStats,
    })
  },
}))

// Helper function to calculate stats
function calculateStats(matches: MatchWithSets[]) {
  const totalMatches = matches.length
  const wins = matches.filter(m => m.result === 'win').length
  const losses = matches.filter(m => m.result === 'loss').length
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

  // Calculate streak
  let streak = 0
  for (const match of matches) {
    if (match.result === 'win') {
      streak++
    } else {
      break
    }
  }

  return { totalMatches, wins, losses, winRate, streak }
}
