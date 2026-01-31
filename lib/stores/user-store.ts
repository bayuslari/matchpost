import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & {
  match_sets: MatchSet[]
  isOwner?: boolean  // true if current user created this match
  creatorProfile?: Profile | null  // profile of match creator (for shared matches)
}

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

      // Fetch matches where user is involved (creator, opponent, or partner)
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, match_sets(*), creator:profiles!matches_user_id_fkey(*)')
        .or(`user_id.eq.${user.id},opponent_user_id.eq.${user.id},partner_user_id.eq.${user.id},opponent_partner_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      // Add isOwner flag and creatorProfile to each match
      const matches = (matchesData || []).map(match => ({
        ...match,
        isOwner: match.user_id === user.id,
        creatorProfile: match.creator as Profile | null,
      })) as MatchWithSets[]

      // Calculate stats for all matches (with result flipped for opponent-side shared matches)
      const statsMatches = matches.map(m => {
        if (m.isOwner) return m
        // For shared matches, check if user is on opponent side
        const isOnOpponentSide = m.opponent_user_id === user.id || m.opponent_partner_user_id === user.id
        if (isOnOpponentSide) {
          // Flip the result for stats
          let flippedResult = m.result
          if (m.result === 'win') flippedResult = 'loss'
          else if (m.result === 'loss') flippedResult = 'win'
          return { ...m, result: flippedResult }
        }
        return m
      })
      const stats = calculateStats(statsMatches)

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
      .select('*, match_sets(*), creator:profiles!matches_user_id_fkey(*)')
      .or(`user_id.eq.${user.id},opponent_user_id.eq.${user.id},partner_user_id.eq.${user.id},opponent_partner_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const matches = (matchesData || []).map(match => ({
      ...match,
      isOwner: match.user_id === user.id,
      creatorProfile: match.creator as Profile | null,
    })) as MatchWithSets[]

    // Calculate stats for all matches (with result flipped for opponent-side shared matches)
    const statsMatches = matches.map(m => {
      if (m.isOwner) return m
      // For shared matches, check if user is on opponent side
      const isOnOpponentSide = m.opponent_user_id === user.id || m.opponent_partner_user_id === user.id
      if (isOnOpponentSide) {
        // Flip the result for stats
        let flippedResult = m.result
        if (m.result === 'win') flippedResult = 'loss'
        else if (m.result === 'loss') flippedResult = 'win'
        return { ...m, result: flippedResult }
      }
      return m
    })
    const stats = calculateStats(statsMatches)

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
    const newMatches = [match, ...matches]
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

  // Calculate current streak (matches are already sorted desc by played_at)
  let streak = 0
  for (const match of matches) {
    if (match.result === 'win') {
      streak++
    } else {
      break
    }
  }

  // Calculate longest streak (sort ascending for this calculation)
  let longestStreak = 0
  let tempStreak = 0
  const sortedMatches = [...matches].sort((a, b) =>
    new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  )
  for (const match of sortedMatches) {
    if (match.result === 'win') {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Calculate monthly data (last 4 months)
  const monthlyMap = new Map<string, { wins: number; losses: number }>()
  const now = new Date()

  // Initialize last 4 months
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleDateString('en-US', { month: 'short' })
    monthlyMap.set(key, { wins: 0, losses: 0 })
  }

  // Count matches per month
  for (const match of matches) {
    const matchDate = new Date(match.played_at)
    const monthKey = matchDate.toLocaleDateString('en-US', { month: 'short' })

    if (monthlyMap.has(monthKey)) {
      const current = monthlyMap.get(monthKey)!
      if (match.result === 'win') {
        current.wins++
      } else if (match.result === 'loss') {
        current.losses++
      }
    }
  }

  const monthlyData: MonthlyData[] = []
  monthlyMap.forEach((value, key) => {
    monthlyData.push({ month: key, ...value })
  })

  return { totalMatches, wins, losses, winRate, streak, longestStreak, monthlyData }
}
