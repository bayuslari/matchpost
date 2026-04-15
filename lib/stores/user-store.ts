import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match, MatchSet } from '@/lib/database.types'
import { calculateAchievements, type Achievement } from '@/lib/achievements'
import { calculateGrowthScore, type GrowthLabel } from '@/lib/utils/growth-score'

const CACHE_KEY = 'matchpost_user_cache'
const CACHE_VERSION = 1

type CachedData = {
  version: number
  profile: Profile | null
  matches: MatchWithSets[]
  stats: UserState['stats']
  timestamp: number
}

// Helper to save to localStorage
function saveToCache(data: Omit<CachedData, 'version' | 'timestamp'>) {
  if (typeof window === 'undefined') return
  try {
    const cached: CachedData = {
      ...data,
      version: CACHE_VERSION,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage might be full or disabled
  }
}

// Helper to load from localStorage
function loadFromCache(): Omit<CachedData, 'version' | 'timestamp'> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedData = JSON.parse(raw)
    // Check version compatibility
    if (cached.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return {
      profile: cached.profile,
      matches: cached.matches,
      stats: cached.stats,
    }
  } catch {
    return null
  }
}

// Helper to clear cache
function clearCache() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore errors
  }
}

type MatchWithSets = Match & {
  match_sets: MatchSet[]
  isOwner?: boolean  // true if current user created this match
  creatorProfile?: Profile | null  // profile of match creator (for shared matches)
  opponentProfile?: Profile | null  // profile of opponent (if linked)
  partnerProfile?: Profile | null  // profile of partner (if linked)
  opponentPartnerProfile?: Profile | null  // profile of opponent's partner (if linked)
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
  userId: string | null  // current authenticated user's ID
  isGuest: boolean
  isLoading: boolean
  isInitialized: boolean
  isInitializing: boolean  // Lock to prevent duplicate initialize calls

  // Computed
  stats: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    streak: number
    longestStreak: number
    monthlyData: MonthlyData[]
    growthScore: number
    growthLabel: GrowthLabel
  }
  achievements: Achievement[]
  pendingAchievements: Achievement[]  // Newly unlocked, not yet toasted
  pendingConfirmations: MatchWithSets[]  // Matches where user is opponent and status=pending

  // Actions
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshMatches: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => void
  addMatch: (match: MatchWithSets) => void
  removeMatch: (matchId: string) => void
  clearPendingAchievements: () => void
  confirmMatch: (matchId: string) => Promise<void>
  disputeMatch: (matchId: string) => Promise<void>
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
  growthScore: 0,
  growthLabel: 'Beginner' as GrowthLabel,
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  profile: null,
  matches: [],
  userId: null,
  isGuest: false,
  isLoading: true,
  isInitialized: false,
  isInitializing: false,
  stats: initialStats,
  achievements: [],
  pendingAchievements: [],
  pendingConfirmations: [],

  // Initialize user data (call once on app load)
  initialize: async () => {
    const { isInitialized, isInitializing } = get()

    // Already initialized - just ensure loading is false
    if (isInitialized) {
      set({ isLoading: false })
      return
    }

    // Already initializing - prevent duplicate calls
    if (isInitializing) {
      return
    }

    // Set lock immediately (synchronous) before any async operations
    set({ isInitializing: true })

    // Try to load from cache first for instant display
    const cached = loadFromCache()
    if (cached && cached.profile) {
      set({
        profile: cached.profile,
        matches: cached.matches,
        stats: cached.stats,
        isGuest: false,
        isLoading: false,  // Show cached data immediately
      })
    } else {
      set({ isLoading: true })
    }

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        clearCache()
        set({ userId: null, isGuest: true, isLoading: false, isInitialized: true, isInitializing: false })
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
        .select(`
          *,
          match_sets(*),
          creator:profiles!matches_user_id_fkey(*),
          opponent:profiles!matches_opponent_user_id_fkey(*),
          partner:profiles!matches_partner_user_id_fkey(*),
          opponent_partner:profiles!matches_opponent_partner_user_id_fkey(*)
        `)
        .or(`user_id.eq.${user.id},opponent_user_id.eq.${user.id},partner_user_id.eq.${user.id},opponent_partner_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      // Add isOwner flag and profiles to each match
      const matches = (matchesData || []).map(match => ({
        ...match,
        isOwner: match.user_id === user.id,
        creatorProfile: match.creator as Profile | null,
        opponentProfile: match.opponent as Profile | null,
        partnerProfile: match.partner as Profile | null,
        opponentPartnerProfile: match.opponent_partner as Profile | null,
      })) as MatchWithSets[]

      // Calculate stats for all matches (with result flipped for opponent-side shared matches)
      // For non-owner matches: only count confirmed/auto (exclude pending incoming)
      const statsMatches = matches
        .filter(m => m.isOwner || m.confirmation_status === 'auto' || m.confirmation_status === 'confirmed')
        .map(m => {
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
      const achievements = calculateAchievements(statsMatches, stats)

      // Diff against seen achievements (stored in profile) to find newly unlocked ones
      const seenIds: string[] = profileData?.seen_achievement_ids ?? []
      const newlyUnlocked = achievements.filter(a => a.unlocked && !seenIds.includes(a.id))

      // Matches waiting for current user to confirm
      const pendingConfirmations = matches.filter(
        m => m.opponent_user_id === user.id && m.confirmation_status === 'pending'
      )

      // Save to cache for next visit
      saveToCache({ profile: profileData, matches, stats })

      set({
        profile: profileData,
        matches,
        userId: user.id,
        stats,
        achievements,
        pendingAchievements: newlyUnlocked,
        pendingConfirmations,
        isGuest: false,
        isLoading: false,
        isInitialized: true,
        isInitializing: false,
      })
    } catch (error) {
      console.error('Failed to initialize user:', error)
      set({ isLoading: false, isInitialized: true, isInitializing: false })
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
      const { matches, stats } = get()
      saveToCache({ profile: profileData, matches, stats })
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
      .select(`
        *,
        match_sets(*),
        creator:profiles!matches_user_id_fkey(*),
        opponent:profiles!matches_opponent_user_id_fkey(*),
        partner:profiles!matches_partner_user_id_fkey(*),
        opponent_partner:profiles!matches_opponent_partner_user_id_fkey(*)
      `)
      .or(`user_id.eq.${user.id},opponent_user_id.eq.${user.id},partner_user_id.eq.${user.id},opponent_partner_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const matches = (matchesData || []).map(match => ({
      ...match,
      isOwner: match.user_id === user.id,
      creatorProfile: match.creator as Profile | null,
      opponentProfile: match.opponent as Profile | null,
      partnerProfile: match.partner as Profile | null,
      opponentPartnerProfile: match.opponent_partner as Profile | null,
    })) as MatchWithSets[]

    // Calculate stats for all matches (with result flipped for opponent-side shared matches)
    // For non-owner matches: only count confirmed/auto (exclude pending incoming)
    const statsMatches = matches
      .filter(m => m.isOwner || m.confirmation_status === 'auto' || m.confirmation_status === 'confirmed')
      .map(m => {
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
    const achievements = calculateAchievements(statsMatches, stats)

    const pendingConfirmations = matches.filter(
      m => m.opponent_user_id === user.id && m.confirmation_status === 'pending'
    )

    const { profile } = get()
    saveToCache({ profile, matches, stats })
    set({ matches, stats, achievements, pendingConfirmations })
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
    const { matches, profile, userId } = get()
    const newMatches = [match, ...matches]
    const statsMatches = newMatches
      .filter(m => m.isOwner || m.confirmation_status === 'auto' || m.confirmation_status === 'confirmed')
      .map(m => {
        if (m.isOwner) return m
        const isOnOpponentSide = m.opponent_user_id === userId || m.opponent_partner_user_id === userId
        if (isOnOpponentSide) {
          let flippedResult = m.result
          if (m.result === 'win') flippedResult = 'loss'
          else if (m.result === 'loss') flippedResult = 'win'
          return { ...m, result: flippedResult }
        }
        return m
      })
    const stats = calculateStats(statsMatches)
    const achievements = calculateAchievements(statsMatches, stats)
    // Check for newly unlocked achievements (use profile.seen_achievement_ids from store)
    const seenIds: string[] = profile?.seen_achievement_ids ?? []
    const newlyUnlocked = achievements.filter(a => a.unlocked && !seenIds.includes(a.id))
    const pendingConfirmations = newMatches.filter(
      m => m.opponent_user_id === userId && m.confirmation_status === 'pending'
    )
    saveToCache({ profile, matches: newMatches, stats })
    set({ matches: newMatches, stats, achievements, pendingAchievements: newlyUnlocked, pendingConfirmations })
  },

  // Remove match locally
  removeMatch: (matchId) => {
    const { matches, profile, userId } = get()
    const newMatches = matches.filter(m => m.id !== matchId)
    const statsMatches = newMatches
      .filter(m => m.isOwner || m.confirmation_status === 'auto' || m.confirmation_status === 'confirmed')
      .map(m => {
        if (m.isOwner) return m
        const isOnOpponentSide = m.opponent_user_id === userId || m.opponent_partner_user_id === userId
        if (isOnOpponentSide) {
          let flippedResult = m.result
          if (m.result === 'win') flippedResult = 'loss'
          else if (m.result === 'loss') flippedResult = 'win'
          return { ...m, result: flippedResult }
        }
        return m
      })
    const stats = calculateStats(statsMatches)
    const achievements = calculateAchievements(statsMatches, stats)
    const pendingConfirmations = newMatches.filter(
      m => m.opponent_user_id === userId && m.confirmation_status === 'pending'
    )
    saveToCache({ profile, matches: newMatches, stats })
    set({ matches: newMatches, stats, achievements, pendingConfirmations })
  },

  // Mark pending achievements as seen — persist to Supabase (fire-and-forget)
  clearPendingAchievements: () => {
    const { pendingAchievements, profile, matches, stats } = get()
    if (pendingAchievements.length === 0) return

    const newIds = pendingAchievements.map(a => a.id)
    const merged = Array.from(new Set([...(profile?.seen_achievement_ids ?? []), ...newIds]))

    // Update local state + cache immediately for snappy UI
    const updatedProfile = profile ? { ...profile, seen_achievement_ids: merged } : profile
    saveToCache({ profile: updatedProfile, matches, stats })
    set({ pendingAchievements: [], profile: updatedProfile })

    // Persist to Supabase in the background (guest: profile is null, skip)
    if (updatedProfile) {
      const supabase = createClient()
      supabase
        .from('profiles')
        .update({ seen_achievement_ids: merged })
        .eq('id', updatedProfile.id)
        .then(() => {})
    }
  },

  // Confirm a pending match (opponent action)
  confirmMatch: async (matchId) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('matches')
      .update({ confirmation_status: 'confirmed' })
      .eq('id', matchId)

    if (!error) {
      const { matches, userId } = get()
      const updatedMatches = matches.map(m =>
        m.id === matchId ? { ...m, confirmation_status: 'confirmed' as const } : m
      )
      const pendingConfirmations = updatedMatches.filter(
        m => m.opponent_user_id === userId && m.confirmation_status === 'pending'
      )
      set({ matches: updatedMatches, pendingConfirmations })
    }
  },

  // Dispute a pending match (opponent action)
  disputeMatch: async (matchId) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('matches')
      .update({ confirmation_status: 'disputed' })
      .eq('id', matchId)

    if (!error) {
      const { matches, userId } = get()
      const updatedMatches = matches.map(m =>
        m.id === matchId ? { ...m, confirmation_status: 'disputed' as const } : m
      )
      const pendingConfirmations = updatedMatches.filter(
        m => m.opponent_user_id === userId && m.confirmation_status === 'pending'
      )
      set({ matches: updatedMatches, pendingConfirmations })
    }
  },

  // Reset store (on logout)
  reset: () => {
    clearCache()
    set({
      profile: null,
      matches: [],
      userId: null,
      isGuest: false,
      isLoading: false,
      isInitialized: false,
      isInitializing: false,
      stats: initialStats,
      achievements: [],
      pendingAchievements: [],
      pendingConfirmations: [],
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

  // Count recent matches (last 30 days) for growth score consistency component
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentMatches = matches.filter(m => new Date(m.played_at).getTime() >= thirtyDaysAgo).length

  const { score: growthScore, label: growthLabel } = calculateGrowthScore({
    totalMatches,
    winRate,
    longestStreak,
    recentMatches,
  })

  return { totalMatches, wins, losses, winRate, streak, longestStreak, monthlyData, growthScore, growthLabel }
}
