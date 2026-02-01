'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MapPin, Trophy, User, Swords } from 'lucide-react'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & {
  match_sets: MatchSet[]
  creatorProfile?: Profile | null
  viewerResult?: 'win' | 'loss' | 'draw' | null  // Result from profile owner's perspective
  isProfileOwnerMatch?: boolean  // true if profile owner created this match
}

interface UserStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
}

interface HeadToHeadStats {
  totalMatches: number
  viewerWins: number
  profileWins: number
  draws: number
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const supabase = useMemo(() => createClient(), [])

  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; profile: Profile | null } | null>(null)
  const [stats, setStats] = useState<UserStats>({ totalMatches: 0, wins: 0, losses: 0, winRate: 0 })
  const [h2hStats, setH2hStats] = useState<HeadToHeadStats | null>(null)
  const [recentMatches, setRecentMatches] = useState<MatchWithSets[]>([])
  const [mutualMatches, setMutualMatches] = useState<MatchWithSets[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'mutual'>('recent')

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
        .select('*, match_sets(*), creator:profiles!matches_user_id_fkey(*)')
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
            viewerResult,
            isProfileOwnerMatch
          }
        }) as MatchWithSets[]

        // Calculate stats
        const wins = processedMatches.filter(m => m.viewerResult === 'win').length
        const losses = processedMatches.filter(m => m.viewerResult === 'loss').length
        const total = processedMatches.length

        setStats({
          totalMatches: total,
          wins,
          losses,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 0
        })

        // Set recent matches (limit to 10)
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

  const renderMatchCard = (match: MatchWithSets) => {
    // Determine the opponent display from profile owner's perspective
    const isProfileOwnerMatch = match.isProfileOwnerMatch
    const profileOnOpponentSide = match.opponent_user_id === profile?.id ||
                                  match.opponent_partner_user_id === profile?.id

    let opponentDisplay: string
    let partnerDisplay: string | null = null
    let flipScore = false

    if (isProfileOwnerMatch) {
      // Profile owner created this match, show opponent
      opponentDisplay = match.opponent_name
      if (match.match_type === 'doubles') {
        partnerDisplay = match.partner_name
      }
    } else if (profileOnOpponentSide) {
      // Profile owner was on opponent side, flip perspective
      opponentDisplay = match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'
      if (match.match_type === 'doubles') {
        partnerDisplay = match.opponent_partner_user_id === profile?.id
          ? match.opponent_name
          : match.opponent_partner_name
      }
      flipScore = true
    } else {
      // Profile owner was partner
      opponentDisplay = match.opponent_name
      if (match.match_type === 'doubles') {
        partnerDisplay = match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'
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

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-900 dark:text-white font-medium">
              vs {opponentDisplay}
            </span>
            {match.match_type === 'doubles' && partnerDisplay && (
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                (with {partnerDisplay})
              </span>
            )}
          </div>
          <div className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
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
      <div className="bg-yellow-500 text-gray-900 px-6 pb-24 rounded-b-3xl header-safe-area">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-yellow-400/50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-10 h-10 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {profile?.username && <p className="text-yellow-800">@{profile.username}</p>}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {profile?.location && (
                <span className="text-yellow-800 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </span>
              )}
              {skillLevel && (
                <span className="text-yellow-800 text-sm flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {skillLevel}
                </span>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
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
        </div>
      )}

      {/* Own profile redirect hint */}
      {isOwnProfile && (
        <div className="px-6 mt-4">
          <Link
            href="/profile"
            className="block bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm text-center py-3 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            This is your profile. Go to settings →
          </Link>
        </div>
      )}

      {/* Matches Section */}
      <div className="px-6 mt-6">
        {/* Tab Header - only show if there are mutual matches */}
        {mutualMatches.length > 0 && !isOwnProfile && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'recent'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Recent ({recentMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('mutual')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'mutual'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              With You ({mutualMatches.length})
            </button>
          </div>
        )}

        {/* Section Title - only show if no tabs */}
        {(mutualMatches.length === 0 || isOwnProfile) && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Recent Matches</h3>
        )}

        {/* Match List */}
        {activeTab === 'recent' ? (
          recentMatches.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No public matches yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMatches.map(renderMatchCard)}
            </div>
          )
        ) : (
          mutualMatches.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No matches together yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mutualMatches.map(renderMatchCard)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
