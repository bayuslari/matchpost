'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { useUserStore } from '@/lib/stores/user-store'
import type { MatchSet } from '@/lib/database.types'

export default function DashboardPage() {
  const { profile, matches, stats, isGuest, isLoading, initialize, removeMatch, refreshMatches } = useUserStore()
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
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

  // Format score from sets
  const formatScore = (matchSets: MatchSet[]) => {
    if (!matchSets || matchSets.length === 0) return '-'
    return matchSets
      .sort((a, b) => a.set_number - b.set_number)
      .map(s => `${s.player_score}-${s.opponent_score}`)
      .join(', ')
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

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
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-6">
        {/* Animated Logo */}
        <div className="text-4xl font-outfit font-black tracking-tight">
          <span className="text-yellow-500 animate-pulse">MATCH</span>
          <span className="text-gray-800 dark:text-white">POST</span>
        </div>

        {/* Progress Bar */}
        <div className="w-48 space-y-2">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full animate-loading-bar"></div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
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
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 p-6 pb-20 rounded-b-3xl">
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

        {/* Stats Cards */}
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
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {isGuest ? 'Your Matches' : 'Recent Matches'}
        </h2>
        {matches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🎾</div>
            <p className="text-gray-500 dark:text-gray-400">
              {isGuest ? 'No demo matches yet' : 'No matches yet'}
            </p>
            <Link
              href="/record"
              className="text-yellow-600 dark:text-yellow-400 font-semibold mt-2 inline-block hover:underline"
            >
              {isGuest ? 'Try recording a demo match →' : 'Record your first match →'}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
              >
                <Link
                  href={`/story-card?matchId=${match.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${match.result === 'win' ? 'bg-yellow-500' : 'bg-red-400'}`}></div>
                  <div className="min-w-0 flex-1">
                    {match.match_type === 'doubles' ? (
                      <div className="font-semibold text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{match.opponent_name}</span>
                          <span className="text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded flex-shrink-0">
                            2v2
                          </span>
                        </div>
                        <div className="truncate">{match.opponent_partner_name || 'Partner'}</div>
                      </div>
                    ) : (
                      <div className="font-semibold text-gray-800 dark:text-white truncate">
                        {match.opponent_name}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(match.played_at)}</div>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/story-card?matchId=${match.id}`} className="text-right">
                    <div className={`font-bold ${match.result === 'win' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                      {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatScore(match.match_sets)}</div>
                  </Link>
                  <button
                    onClick={() => setDeleteMatchId(match.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
