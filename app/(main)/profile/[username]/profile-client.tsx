'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MapPin, Trophy, User, Swords, Share2, Flame, ChevronDown, Settings } from 'lucide-react'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & {
  match_sets: MatchSet[]
  creatorProfile?: Profile | null
  opponentProfile?: Profile | null
  partnerProfile?: Profile | null
  opponentPartnerProfile?: Profile | null
  viewerResult?: 'win' | 'loss' | 'draw' | null  // Result from profile owner's perspective
  isProfileOwnerMatch?: boolean  // true if profile owner created this match
}

interface UserStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  currentStreak: number
  longestStreak: number
  singles: { total: number; wins: number; losses: number; winRate: number }
  doubles: { total: number; wins: number; losses: number; winRate: number }
}

interface FrequentPlayer {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
  count: number
  wins: number
  losses: number
}

interface HeadToHeadStats {
  totalMatches: number
  viewerWins: number
  profileWins: number
  draws: number
}

interface ProfileClientProps {
  username: string
}

export default function ProfileClient({ username }: ProfileClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; profile: Profile | null } | null>(null)
  const [stats, setStats] = useState<UserStats>({
    totalMatches: 0, wins: 0, losses: 0, winRate: 0,
    currentStreak: 0, longestStreak: 0,
    singles: { total: 0, wins: 0, losses: 0, winRate: 0 },
    doubles: { total: 0, wins: 0, losses: 0, winRate: 0 }
  })
  const [h2hStats, setH2hStats] = useState<HeadToHeadStats | null>(null)
  const [allMatches, setAllMatches] = useState<MatchWithSets[]>([])
  const [recentMatches, setRecentMatches] = useState<MatchWithSets[]>([])
  const [mutualMatches, setMutualMatches] = useState<MatchWithSets[]>([])
  const [frequentOpponents, setFrequentOpponents] = useState<FrequentPlayer[]>([])
  const [frequentPartners, setFrequentPartners] = useState<FrequentPlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'mutual'>('recent')
  const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | 'singles' | 'doubles'>('all')
  const [displayCount, setDisplayCount] = useState(10)
  const [frequentTab, setFrequentTab] = useState<'opponents' | 'partners'>('opponents')

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)

      // Check if viewing own profile
      const { data: { user } } = await supabase.auth.getUser()

      // Fetch current user's profile if logged in
      let currentUserProfile: Profile | null = null
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        currentUserProfile = userProfile
        setCurrentUser({ id: user.id, profile: userProfile })
      }

      // Fetch profile by username
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profileData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setProfile(profileData)
      setIsOwnProfile(user?.id === profileData.id)

      // Fetch ALL matches where profile owner is involved (as creator, opponent, or partner)
      const { data: allMatches } = await supabase
        .from('matches')
        .select(`
          *,
          match_sets(*),
          creator:profiles!matches_user_id_fkey(*),
          opponent:profiles!matches_opponent_user_id_fkey(*),
          partner:profiles!matches_partner_user_id_fkey(*),
          opponent_partner:profiles!matches_opponent_partner_user_id_fkey(*)
        `)
        .or(`user_id.eq.${profileData.id},opponent_user_id.eq.${profileData.id},partner_user_id.eq.${profileData.id},opponent_partner_user_id.eq.${profileData.id}`)
        .eq('is_public', true)
        .order('played_at', { ascending: false })

      if (allMatches) {
        // Process matches to determine result from profile owner's perspective
        const processedMatches = allMatches.map(match => {
          const isProfileOwnerMatch = match.user_id === profileData.id
          const isOnOpponentSide = match.opponent_user_id === profileData.id ||
                                   match.opponent_partner_user_id === profileData.id

          // Determine result from profile owner's perspective
          let viewerResult = match.result
          if (!isProfileOwnerMatch && isOnOpponentSide) {
            // Flip result if profile owner is on opponent side
            if (match.result === 'win') viewerResult = 'loss'
            else if (match.result === 'loss') viewerResult = 'win'
          }

          return {
            ...match,
            creatorProfile: match.creator as Profile | null,
            opponentProfile: match.opponent as Profile | null,
            partnerProfile: match.partner as Profile | null,
            opponentPartnerProfile: match.opponent_partner as Profile | null,
            viewerResult,
            isProfileOwnerMatch
          }
        }) as MatchWithSets[]

        // Calculate stats
        const wins = processedMatches.filter(m => m.viewerResult === 'win').length
        const losses = processedMatches.filter(m => m.viewerResult === 'loss').length
        const total = processedMatches.length

        // Calculate streaks (matches sorted by played_at desc)
        let currentStreak = 0
        for (const match of processedMatches) {
          if (match.viewerResult === 'win') {
            currentStreak++
          } else {
            break
          }
        }

        // Calculate longest streak (need to sort asc for this)
        let longestStreak = 0
        let tempStreak = 0
        const sortedAsc = [...processedMatches].reverse()
        for (const match of sortedAsc) {
          if (match.viewerResult === 'win') {
            tempStreak++
            longestStreak = Math.max(longestStreak, tempStreak)
          } else {
            tempStreak = 0
          }
        }

        // Calculate singles/doubles breakdown
        const singlesMatches = processedMatches.filter(m => m.match_type === 'singles')
        const doublesMatches = processedMatches.filter(m => m.match_type === 'doubles')

        const singlesWins = singlesMatches.filter(m => m.viewerResult === 'win').length
        const singlesLosses = singlesMatches.filter(m => m.viewerResult === 'loss').length
        const doublesWins = doublesMatches.filter(m => m.viewerResult === 'win').length
        const doublesLosses = doublesMatches.filter(m => m.viewerResult === 'loss').length

        setStats({
          totalMatches: total,
          wins,
          losses,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
          currentStreak,
          longestStreak,
          singles: {
            total: singlesMatches.length,
            wins: singlesWins,
            losses: singlesLosses,
            winRate: singlesMatches.length > 0 ? Math.round((singlesWins / singlesMatches.length) * 100) : 0
          },
          doubles: {
            total: doublesMatches.length,
            wins: doublesWins,
            losses: doublesLosses,
            winRate: doublesMatches.length > 0 ? Math.round((doublesWins / doublesMatches.length) * 100) : 0
          }
        })

        // Calculate frequent opponents
        const opponentMap = new Map<string, FrequentPlayer>()
        processedMatches.forEach(match => {
          const isProfileOwner = match.user_id === profileData.id
          const onOpponentSide = match.opponent_user_id === profileData.id || match.opponent_partner_user_id === profileData.id

          // Determine who the opponents are from profile owner's perspective
          if (isProfileOwner || (!isProfileOwner && !onOpponentSide)) {
            // Profile owner created match OR was partner - opponents are opponent_user
            if (match.opponent_user_id) {
              const key = match.opponent_user_id
              const existing = opponentMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                opponentMap.set(key, {
                  id: key,
                  name: match.opponentProfile?.full_name || match.opponentProfile?.username || match.opponent_name,
                  username: match.opponentProfile?.username || null,
                  avatarUrl: match.opponentProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
            // For doubles, also add opponent partner
            if (match.match_type === 'doubles' && match.opponent_partner_user_id) {
              const key = match.opponent_partner_user_id
              const existing = opponentMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                opponentMap.set(key, {
                  id: key,
                  name: match.opponentPartnerProfile?.full_name || match.opponentPartnerProfile?.username || match.opponent_partner_name || 'Unknown',
                  username: match.opponentPartnerProfile?.username || null,
                  avatarUrl: match.opponentPartnerProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
          } else {
            // Profile owner was on opponent side - opponents are creator + partner
            if (match.user_id) {
              const key = match.user_id
              const existing = opponentMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                opponentMap.set(key, {
                  id: key,
                  name: match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown',
                  username: match.creatorProfile?.username || null,
                  avatarUrl: match.creatorProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
            if (match.match_type === 'doubles' && match.partner_user_id) {
              const key = match.partner_user_id
              const existing = opponentMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                opponentMap.set(key, {
                  id: key,
                  name: match.partnerProfile?.full_name || match.partnerProfile?.username || match.partner_name || 'Unknown',
                  username: match.partnerProfile?.username || null,
                  avatarUrl: match.partnerProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
          }
        })

        const sortedOpponents = Array.from(opponentMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setFrequentOpponents(sortedOpponents)

        // Calculate frequent partners (doubles only)
        const partnerMap = new Map<string, FrequentPlayer>()
        doublesMatches.forEach(match => {
          const isProfileOwner = match.user_id === profileData.id
          const onOpponentSide = match.opponent_user_id === profileData.id || match.opponent_partner_user_id === profileData.id

          if (isProfileOwner) {
            // Profile owner created match - partner is partner_user
            if (match.partner_user_id) {
              const key = match.partner_user_id
              const existing = partnerMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                partnerMap.set(key, {
                  id: key,
                  name: match.partnerProfile?.full_name || match.partnerProfile?.username || match.partner_name || 'Unknown',
                  username: match.partnerProfile?.username || null,
                  avatarUrl: match.partnerProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
          } else if (onOpponentSide) {
            // Profile owner was on opponent side - partner is the other opponent
            const partnerId = match.opponent_user_id === profileData.id ? match.opponent_partner_user_id : match.opponent_user_id
            if (partnerId) {
              const key = partnerId
              const existing = partnerMap.get(key)
              const isWin = match.viewerResult === 'win'
              const partnerProfile = match.opponent_user_id === profileData.id ? match.opponentPartnerProfile : match.opponentProfile
              const partnerName = match.opponent_user_id === profileData.id ? match.opponent_partner_name : match.opponent_name
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                partnerMap.set(key, {
                  id: key,
                  name: partnerProfile?.full_name || partnerProfile?.username || partnerName || 'Unknown',
                  username: partnerProfile?.username || null,
                  avatarUrl: partnerProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
          } else {
            // Profile owner was partner on creator side - partner is creator
            if (match.user_id) {
              const key = match.user_id
              const existing = partnerMap.get(key)
              const isWin = match.viewerResult === 'win'
              if (existing) {
                existing.count++
                if (isWin) existing.wins++
                else if (match.viewerResult === 'loss') existing.losses++
              } else {
                partnerMap.set(key, {
                  id: key,
                  name: match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown',
                  username: match.creatorProfile?.username || null,
                  avatarUrl: match.creatorProfile?.avatar_url || null,
                  count: 1,
                  wins: isWin ? 1 : 0,
                  losses: match.viewerResult === 'loss' ? 1 : 0
                })
              }
            }
          }
        })

        const sortedPartners = Array.from(partnerMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setFrequentPartners(sortedPartners)

        // Store all matches and set recent matches
        setAllMatches(processedMatches)
        setRecentMatches(processedMatches.slice(0, 10))

        // Find mutual matches with current user (if logged in and not own profile)
        if (user && user.id !== profileData.id) {
          const mutual = processedMatches.filter(match => {
            // Check if current user is involved in this match
            return match.user_id === user.id ||
                   match.opponent_user_id === user.id ||
                   match.partner_user_id === user.id ||
                   match.opponent_partner_user_id === user.id
          })

          setMutualMatches(mutual)

          // Calculate head-to-head stats
          if (mutual.length > 0) {
            let viewerWins = 0
            let profileWins = 0
            let draws = 0

            mutual.forEach(match => {
              // Determine if viewer and profile owner are on the same team
              const profileIsCreator = match.user_id === profileData.id
              const viewerIsCreator = match.user_id === user.id
              const profileOnOpponentSide = match.opponent_user_id === profileData.id ||
                                           match.opponent_partner_user_id === profileData.id
              const viewerOnOpponentSide = match.opponent_user_id === user.id ||
                                          match.opponent_partner_user_id === user.id

              // If they're on the same side (both creator side or both opponent side), skip
              const profileOnCreatorSide = profileIsCreator ||
                                          match.partner_user_id === profileData.id
              const viewerOnCreatorSide = viewerIsCreator ||
                                         match.partner_user_id === user.id

              if ((profileOnCreatorSide && viewerOnCreatorSide) ||
                  (profileOnOpponentSide && viewerOnOpponentSide)) {
                // They were teammates, don't count in H2H
                return
              }

              // They were opponents
              if (match.result === 'draw') {
                draws++
              } else if (match.result === 'win') {
                // Match creator won
                if (viewerOnCreatorSide) {
                  viewerWins++
                } else {
                  profileWins++
                }
              } else if (match.result === 'loss') {
                // Match creator lost
                if (viewerOnCreatorSide) {
                  profileWins++
                } else {
                  viewerWins++
                }
              }
            })

            const h2hTotal = viewerWins + profileWins + draws
            if (h2hTotal > 0) {
              setH2hStats({
                totalMatches: h2hTotal,
                viewerWins,
                profileWins,
                draws
              })
            }
          }
        }
      }

      setIsLoading(false)
    }

    if (username) {
      fetchProfile()
    }
  }, [username, supabase])

  const formatScore = (sets: MatchSet[], flip: boolean = false) => {
    const sorted = [...sets].sort((a, b) => a.set_number - b.set_number)
    return sorted.map(s => flip
      ? `${s.opponent_score}-${s.player_score}`
      : `${s.player_score}-${s.opponent_score}`
    ).join(', ')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const skillLevelLabel = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'Beginner'
      case 'intermediate': return 'Intermediate'
      case 'advanced': return 'Advanced'
      case 'pro': return 'Pro'
      default: return null
    }
  }

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${username}`
    const shareData = {
      title: `${profile?.full_name || username}'s Tennis Profile`,
      text: `Check out ${profile?.full_name || username}'s tennis stats on MatchPost!`,
      url
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Profile link copied!')
    }
  }

  // Filter matches based on match type
  const filteredMatches = useMemo(() => {
    const matches = activeTab === 'mutual' ? mutualMatches : allMatches
    if (matchTypeFilter === 'all') return matches
    return matches.filter(m => m.match_type === matchTypeFilter)
  }, [allMatches, mutualMatches, activeTab, matchTypeFilter])

  const displayedMatches = filteredMatches.slice(0, displayCount)

  // Helper component for clickable player names
  const PlayerName = ({ name, linkedProfile, className = '' }: { name: string; linkedProfile?: Profile | null; className?: string }) => {
    if (linkedProfile?.username) {
      return (
        <Link
          href={`/profile/${linkedProfile.username}`}
          onClick={(e) => e.stopPropagation()}
          className={`hover:text-yellow-600 dark:hover:text-yellow-400 hover:underline ${className}`}
        >
          {linkedProfile.full_name || linkedProfile.username || name}
        </Link>
      )
    }
    return <span className={className}>{name}</span>
  }

  const renderMatchCard = (match: MatchWithSets) => {
    // Determine the opponent/partner display from profile owner's perspective
    const isProfileOwnerMatch = match.isProfileOwnerMatch
    const profileOnOpponentSide = match.opponent_user_id === profile?.id ||
                                  match.opponent_partner_user_id === profile?.id

    let opponentName: string
    let opponentProfile: Profile | null = null
    let opponentPartnerName: string | null = null
    let opponentPartnerProfile: Profile | null = null
    let partnerName: string | null = null
    let partnerProfile: Profile | null = null
    let flipScore = false

    if (isProfileOwnerMatch) {
      // Profile owner created this match
      opponentName = match.opponent_name
      opponentProfile = match.opponentProfile || null
      if (match.match_type === 'doubles') {
        partnerName = match.partner_name
        partnerProfile = match.partnerProfile || null
        opponentPartnerName = match.opponent_partner_name
        opponentPartnerProfile = match.opponentPartnerProfile || null
      }
    } else if (profileOnOpponentSide) {
      // Profile owner was on opponent side, flip perspective
      opponentName = match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'
      opponentProfile = match.creatorProfile || null
      if (match.match_type === 'doubles') {
        // Profile owner's partner is the other opponent
        if (match.opponent_user_id === profile?.id) {
          partnerName = match.opponent_partner_name
          partnerProfile = match.opponentPartnerProfile || null
        } else {
          partnerName = match.opponent_name
          partnerProfile = match.opponentProfile || null
        }
        // Their opponent is the creator's partner
        opponentPartnerName = match.partner_name
        opponentPartnerProfile = match.partnerProfile || null
      }
      flipScore = true
    } else {
      // Profile owner was partner on creator's side
      opponentName = match.opponent_name
      opponentProfile = match.opponentProfile || null
      if (match.match_type === 'doubles') {
        partnerName = match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'
        partnerProfile = match.creatorProfile || null
        opponentPartnerName = match.opponent_partner_name
        opponentPartnerProfile = match.opponentPartnerProfile || null
      }
    }

    return (
      <div
        key={match.id}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            match.viewerResult === 'win'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              : match.viewerResult === 'loss'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            {match.viewerResult === 'win' ? 'WIN' : match.viewerResult === 'loss' ? 'LOSS' : 'DRAW'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(match.played_at)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="text-sm text-gray-900 dark:text-white min-w-0">
            <div>
              <span className="text-gray-500 dark:text-gray-400">vs </span>
              <PlayerName name={opponentName} linkedProfile={opponentProfile} className="font-medium" />
              {match.match_type === 'doubles' && opponentPartnerName && (
                <>
                  <span className="text-gray-500 dark:text-gray-400"> & </span>
                  <PlayerName name={opponentPartnerName} linkedProfile={opponentPartnerProfile} className="font-medium" />
                </>
              )}
            </div>
            {match.match_type === 'doubles' && partnerName && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                (with <PlayerName name={partnerName} linkedProfile={partnerProfile} />)
              </div>
            )}
          </div>
          <div className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
            {formatScore(match.match_sets, flipScore)}
          </div>
        </div>

        {match.location && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.location}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header Skeleton */}
        <div className="bg-yellow-500 text-gray-900 px-6 pb-24 rounded-b-3xl header-safe-area">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-600/30 rounded-full animate-pulse"></div>
            <div className="h-7 w-24 bg-yellow-600/30 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-32 bg-yellow-600/30 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-24 bg-yellow-600/30 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Stats Skeleton */}
        <div className="px-6 -mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          @{username} doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-full hover:bg-yellow-400 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  const displayName = profile?.full_name || profile?.username || 'Player'
  const skillLevel = skillLevelLabel(profile?.skill_level || null)
  const viewerName = currentUser?.profile?.full_name || currentUser?.profile?.username || 'You'

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-16 rounded-b-3xl header-safe-area">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-yellow-400/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShareProfile}
              className="p-2 hover:bg-yellow-400/50 rounded-full transition-colors"
              title="Share profile"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {isOwnProfile && (
              <Link
                href="/profile"
                className="p-2 hover:bg-yellow-400/50 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-10 h-10 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{displayName}</h2>
            {profile?.username && <p className="text-yellow-800 text-sm">@{profile.username}</p>}
            <div className="mt-2 space-y-0.5">
              {profile?.location && (
                <div className="text-yellow-800/80 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
              {skillLevel && (
                <div className="text-yellow-800/80 text-sm flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                  {skillLevel}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <p className="mt-4 text-yellow-900/80 text-sm">{profile.bio}</p>
        )}
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          {/* Main Stats */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalMatches}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.wins}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.losses}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Losses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.winRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
            </div>
          </div>

          {/* Streak & Match Type Stats */}
          {(stats.currentStreak > 0 || stats.longestStreak > 0 || stats.singles.total > 0 || stats.doubles.total > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{stats.currentStreak}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">streak</span>
                </div>
              )}
              {stats.longestStreak > 0 && (
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{stats.longestStreak}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">best</span>
                </div>
              )}
              {stats.singles.total > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Singles</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{stats.singles.winRate}%</span>
                  <span className="text-xs text-gray-400">({stats.singles.wins}W-{stats.singles.losses}L)</span>
                </div>
              )}
              {stats.doubles.total > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Doubles</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{stats.doubles.winRate}%</span>
                  <span className="text-xs text-gray-400">({stats.doubles.wins}W-{stats.doubles.losses}L)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Head-to-Head Card */}
      {h2hStats && !isOwnProfile && (
        <div className="px-6 mt-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-5 h-5 text-white" />
              <h3 className="text-white font-bold">Head-to-Head</h3>
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold">{h2hStats.viewerWins}</div>
                <div className="text-xs text-white/80">{viewerName}</div>
              </div>
              <div className="text-center px-4">
                <div className="text-lg font-bold text-white/60">vs</div>
                <div className="text-xs text-white/60">{h2hStats.totalMatches} matches</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold">{h2hStats.profileWins}</div>
                <div className="text-xs text-white/80">{profile?.full_name?.split(' ')[0] || profile?.username}</div>
              </div>
            </div>
            {h2hStats.draws > 0 && (
              <div className="text-center mt-2 text-xs text-white/60">
                {h2hStats.draws} draw{h2hStats.draws > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* All / With You Tabs - directly under H2H */}
          {mutualMatches.length > 0 && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setActiveTab('recent'); setDisplayCount(10) }}
                className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                  activeTab === 'recent'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                All ({allMatches.filter(m => matchTypeFilter === 'all' || m.match_type === matchTypeFilter).length})
              </button>
              <button
                onClick={() => { setActiveTab('mutual'); setDisplayCount(10) }}
                className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                  activeTab === 'mutual'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                With You ({mutualMatches.filter(m => matchTypeFilter === 'all' || m.match_type === matchTypeFilter).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Frequent Players (Tabbed) */}
      {(frequentOpponents.length > 0 || frequentPartners.length > 0) && (
        <div className="px-6 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setFrequentTab('opponents')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  frequentTab === 'opponents'
                    ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Opponents ({frequentOpponents.length})
              </button>
              <button
                onClick={() => setFrequentTab('partners')}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  frequentTab === 'partners'
                    ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Partners ({frequentPartners.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {frequentTab === 'opponents' ? (
                frequentOpponents.length > 0 ? (
                  <div className="space-y-2">
                    {frequentOpponents.map((opponent) => (
                      <div key={opponent.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            {opponent.avatarUrl ? (
                              <Image src={opponent.avatarUrl} alt="" width={28} height={28} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          {opponent.username ? (
                            <Link href={`/profile/${opponent.username}`} className="text-sm text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 truncate">
                              {opponent.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-800 dark:text-white truncate">{opponent.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-5 text-right">{opponent.count}×</span>
                          <span className="text-xs font-medium w-14 text-right">
                            <span className="text-yellow-600 dark:text-yellow-400">{opponent.wins}W</span>
                            <span className="text-gray-400 mx-0.5">-</span>
                            <span className="text-red-500 dark:text-red-400">{opponent.losses}L</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No opponent data yet</p>
                )
              ) : (
                frequentPartners.length > 0 ? (
                  <div className="space-y-2">
                    {frequentPartners.map((partner) => (
                      <div key={partner.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            {partner.avatarUrl ? (
                              <Image src={partner.avatarUrl} alt="" width={28} height={28} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          {partner.username ? (
                            <Link href={`/profile/${partner.username}`} className="text-sm text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 truncate">
                              {partner.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-800 dark:text-white truncate">{partner.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-5 text-right">{partner.count}×</span>
                          <span className="text-xs font-medium w-14 text-right">
                            <span className="text-yellow-600 dark:text-yellow-400">{partner.wins}W</span>
                            <span className="text-gray-400 mx-0.5">-</span>
                            <span className="text-red-500 dark:text-red-400">{partner.losses}L</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No doubles matches yet</p>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Matches Section */}
      <div className="px-6 mt-6">
        {/* Header with title and filter */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Matches</h3>

          {/* Match Type Filter */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => { setMatchTypeFilter('all'); setDisplayCount(10) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                matchTypeFilter === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setMatchTypeFilter('singles'); setDisplayCount(10) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                matchTypeFilter === 'singles'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Singles
            </button>
            <button
              onClick={() => { setMatchTypeFilter('doubles'); setDisplayCount(10) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                matchTypeFilter === 'doubles'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Doubles
            </button>
          </div>
        </div>

        {/* Match List */}
        {filteredMatches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {matchTypeFilter === 'all'
                ? 'No public matches yet'
                : `No ${matchTypeFilter} matches yet`}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayedMatches.map(renderMatchCard)}
            </div>

            {/* Load More Button */}
            {displayCount < filteredMatches.length && (
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
                className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Load more ({filteredMatches.length - displayCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
