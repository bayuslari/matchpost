'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, LogIn, User, ChevronRight, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { useUserStore } from '@/lib/stores/user-store'
import type { MatchSet, Profile } from '@/lib/database.types'

// Format score from sets (with optional flip for viewer's perspective)
function formatScore(matchSets: MatchSet[], flipScore: boolean = false) {
  if (!matchSets || matchSets.length === 0) return '-'
  return matchSets
    .sort((a, b) => a.set_number - b.set_number)
    .map(s => flipScore
      ? `${s.opponent_score}-${s.player_score}`
      : `${s.player_score}-${s.opponent_score}`)
    .join(', ')
}

// Helper component to render player name with optional profile link
function PlayerName({ name, profile, className = '' }: { name: string; profile?: Profile | null; className?: string }) {
  if (profile?.username) {
    return (
      <Link
        href={`/profile/${profile.username}`}
        onClick={(e) => e.stopPropagation()}
        className={`hover:text-yellow-600 dark:hover:text-yellow-400 hover:underline ${className}`}
      >
        {profile.full_name || profile.username || name}
      </Link>
    )
  }
  return <span className={className}>{name}</span>
}

// Format date - moved outside to avoid recreation
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Skeleton component to prevent CLS during loading
function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-20 rounded-b-3xl header-safe-area">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 w-20 bg-yellow-600/30 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-32 bg-yellow-600/30 rounded animate-pulse"></div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="h-9 w-12 bg-yellow-600/30 rounded mx-auto animate-pulse mb-1"></div>
              <div className="h-3 w-14 bg-yellow-600/30 rounded mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4">
            <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-700 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 pb-24">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-1.5 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { profile, matches, stats, isGuest, isLoading, initialize, removeMatch, refreshMatches } = useUserStore()
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(10)
  const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | 'singles' | 'doubles'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Refresh matches when coming from story-card page
  useEffect(() => {
    if (searchParams.get('refresh') === 'true') {
      refreshMatches()
      // Remove the refresh param from URL
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, refreshMatches, router])

  // Filter matches by type and search query
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Filter by match type
      if (matchTypeFilter !== 'all' && match.match_type !== matchTypeFilter) {
        return false
      }
      // Filter by search query (opponent name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const opponentName = match.opponent_name?.toLowerCase() || ''
        const opponentPartnerName = match.opponent_partner_name?.toLowerCase() || ''
        const creatorName = match.creatorProfile?.full_name?.toLowerCase() || match.creatorProfile?.username?.toLowerCase() || ''
        if (!opponentName.includes(query) && !opponentPartnerName.includes(query) && !creatorName.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [matches, matchTypeFilter, searchQuery])

  // Pre-compute match display data to avoid inline calculations
  const matchDisplayData = useMemo(() => {
    return filteredMatches.slice(0, displayLimit).map(match => {
      const onOpponentSide = !match.isOwner && profile?.id &&
        (match.opponent_user_id === profile.id || match.opponent_partner_user_id === profile.id)
      const viewerResult = match.isOwner ? match.result :
        onOpponentSide ? (match.result === 'win' ? 'loss' : match.result === 'loss' ? 'win' : match.result) : match.result

      return {
        ...match,
        onOpponentSide,
        viewerResult,
        formattedDate: formatDate(match.played_at),
        formattedScore: formatScore(match.match_sets, !!onOpponentSide),
        resultBarColor: viewerResult === 'win' ? 'bg-yellow-500' : viewerResult === 'loss' ? 'bg-red-400' : 'bg-gray-400',
        resultTextColor: viewerResult === 'win' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400',
        resultText: viewerResult === 'win' ? 'WIN' : viewerResult === 'loss' ? 'LOSS' : 'DRAW',
      }
    })
  }, [filteredMatches, displayLimit, profile?.id])

  const displayName = isGuest ? 'Guest' : (profile?.full_name || profile?.username || 'Player')

  const handleDelete = async () => {
    if (!deleteMatchId) return

    setIsDeleting(true)
    try {
      // Delete match sets first (due to foreign key)
      await supabase
        .from('match_sets')
        .delete()
        .eq('match_id', deleteMatchId)

      // Delete the match
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', deleteMatchId)

      if (!error) {
        const deletedMatch = matches.find(m => m.id === deleteMatchId)
        trackEvent('delete_match', {
          match_type: deletedMatch?.match_type || undefined,
          match_result: deletedMatch?.result || undefined,
          source: 'dashboard',
        })
        removeMatch(deleteMatchId)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setIsDeleting(false)
    setDeleteMatchId(null)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Delete Confirmation Modal */}
      {deleteMatchId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Match?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                This will permanently delete this match and all its data.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteMatchId(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-20 rounded-b-3xl header-safe-area">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-yellow-800 text-sm">{isGuest ? 'Demo Mode' : 'Welcome back'}</p>
            <h1 className="text-2xl font-bold">{displayName} 👋</h1>
          </div>
          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-full transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-semibold text-sm">Login</span>
            </Link>
          ) : (
            <Link
              href="/profile"
              className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <svg className={`w-6 h-6 text-white/70 ${profile?.avatar_url ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </Link>
          )}
        </div>

        {/* Stats Cards - Clickable to view profile */}
        {!isGuest && profile?.username ? (
          <Link href={`/profile/${profile.username}`} className="grid grid-cols-3 gap-3 group">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center group-hover:bg-white/30 transition-all">
              <div className="text-3xl font-bold">{stats.totalMatches}</div>
              <div className="text-xs text-yellow-800">Matches</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center group-hover:bg-white/30 transition-all">
              <div className="text-3xl font-bold">{stats.winRate}%</div>
              <div className="text-xs text-yellow-800">Win Rate</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center group-hover:bg-white/30 transition-all">
              <div className="text-3xl font-bold">{stats.streak > 0 ? `🔥${stats.streak}` : '0'}</div>
              <div className="text-xs text-yellow-800">Streak</div>
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{stats.totalMatches}</div>
              <div className="text-xs text-yellow-800">Matches</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{stats.winRate}%</div>
              <div className="text-xs text-yellow-800">Win Rate</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{stats.streak > 0 ? `🔥${stats.streak}` : '0'}</div>
              <div className="text-xs text-yellow-800">Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <Link
            href="/record"
            onClick={() => trackEvent('new_match_click', { is_guest: isGuest })}
            className="flex items-center justify-center gap-3 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-xl p-4 transition-all"
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-lg text-gray-700 dark:text-gray-200">New Match</span>
          </Link>
        </div>
      </div>

      {/* Complete Profile Banner */}
      {!isGuest && profile && (!profile.bio || !profile.avatar_url) && (
        <div className="px-6 mt-4">
          <Link
            href="/profile/edit"
            onClick={() => trackEvent('complete_profile_banner_click')}
            className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-white text-sm">Complete your profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add photo and bio to personalize your profile</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Demo Banner for Guest Users */}
      {isGuest && (
        <div className="px-6 mt-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎾</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Try Demo Mode!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Record a match and create a shareable story card. Your data will not be saved in demo mode.
                </p>
                <Link
                  href="/record"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg transition-all"
                >
                  Try it now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      <div className="px-6 mt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {isGuest ? 'Your Matches' : 'Recent Matches'}
          </h2>
          {!isGuest && profile?.username && (
            <Link
              href={`/profile/${profile.username}`}
              className="text-sm text-yellow-600 dark:text-yellow-400 font-medium hover:underline"
            >
              View Profile →
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        {matches.length > 0 && (
          <div className="mb-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by opponent name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Match Type Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'singles', 'doubles'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setMatchTypeFilter(type)
                      setDisplayLimit(10)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      matchTypeFilter === type
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'singles' ? 'Singles' : 'Doubles'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {isGuest ? 'Ready to Play?' : 'Start Your Journey'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
              {isGuest
                ? 'Record a demo match and create shareable story cards'
                : 'Record your first match and track your tennis progress'}
            </p>
            <Link
              href="/record"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              {isGuest ? 'Try Demo Match' : 'Record First Match'}
            </Link>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? `No matches with "${searchQuery}"` : `No ${matchTypeFilter} matches yet`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setMatchTypeFilter('all')
              }}
              className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matchDisplayData.map((match) => (
              <div
                key={match.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-between"
              >
                <Link
                  href={`/story-card?matchId=${match.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${match.resultBarColor}`}></div>
                  <div className="min-w-0 flex-1">
                    {match.isOwner ? (
                      // Owner view: show opponent names
                      match.match_type === 'doubles' ? (
                        <div className="font-semibold text-gray-800 dark:text-white">
                          <div className="truncate">
                            <PlayerName name={match.opponent_name} profile={match.opponentProfile} />
                          </div>
                          <div className="truncate">
                            <PlayerName name={match.opponent_partner_name || 'Partner'} profile={match.opponentPartnerProfile} />
                          </div>
                        </div>
                      ) : (
                        <div className="font-semibold text-gray-800 dark:text-white truncate">
                          <PlayerName name={match.opponent_name} profile={match.opponentProfile} />
                        </div>
                      )
                    ) : (
                      // Shared view: show opponents from viewer's perspective
                      match.onOpponentSide ? (
                        // Viewer is on opponent side - show creator's team as their opponent
                        match.match_type === 'doubles' ? (
                          <div className="font-semibold text-gray-800 dark:text-white">
                            <div className="truncate">
                              <PlayerName
                                name={match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'}
                                profile={match.creatorProfile}
                              />
                            </div>
                            <div className="truncate">
                              <PlayerName name={match.partner_name || 'Partner'} profile={match.partnerProfile} />
                            </div>
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-800 dark:text-white truncate">
                            <PlayerName
                              name={match.creatorProfile?.full_name || match.creatorProfile?.username || 'Unknown'}
                              profile={match.creatorProfile}
                            />
                          </div>
                        )
                      ) : (
                        // Viewer is on partner side - show original opponents
                        match.match_type === 'doubles' ? (
                          <div className="font-semibold text-gray-800 dark:text-white">
                            <div className="truncate">
                              <PlayerName name={match.opponent_name} profile={match.opponentProfile} />
                            </div>
                            <div className="truncate">
                              <PlayerName name={match.opponent_partner_name || 'Partner'} profile={match.opponentPartnerProfile} />
                            </div>
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-800 dark:text-white truncate">
                            <PlayerName name={match.opponent_name} profile={match.opponentProfile} />
                          </div>
                        )
                      )
                    )}
                    {!match.isOwner && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Recorded by {match.creatorProfile?.full_name || match.creatorProfile?.username || 'Someone'}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{match.formattedDate}</span>
                      {match.match_type === 'doubles' && match.isOwner && (match.partner_name || match.partnerProfile) && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[100px]">
                          w/{' '}
                          {match.partnerProfile?.username ? (
                            <Link
                              href={`/profile/${match.partnerProfile.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-yellow-600 dark:hover:text-yellow-400 hover:underline"
                            >
                              {match.partnerProfile.full_name || match.partnerProfile.username}
                            </Link>
                          ) : (
                            match.partnerProfile?.full_name || match.partner_name
                          )}
                        </span>
                      )}
                      {match.match_type === 'doubles' && (
                        <span className="text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded flex-shrink-0">
                          2v2
                        </span>
                      )}
                      {!match.isOwner && (
                        <Link2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/story-card?matchId=${match.id}`} className="text-right">
                    <div className={`font-bold ${match.resultTextColor}`}>
                      {match.resultText}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{match.formattedScore}</div>
                  </Link>
                  {match.isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteMatchId(match.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {filteredMatches.length > displayLimit && (
              <button
                onClick={() => setDisplayLimit(prev => prev + 10)}
                className="w-full py-3 text-center text-yellow-600 dark:text-yellow-400 font-medium hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all"
              >
                Load more ({filteredMatches.length - displayLimit} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
