'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & { match_sets: MatchSet[] }

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchWithSets[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsGuest(true)
        setLoading(false)
        return
      }

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          // Auto-generate username from email if not set
          if (!profileData.username && user.email) {
            const generatedUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .update({ username: generatedUsername })
              .eq('id', user.id)
              .select()
              .single()

            if (updatedProfile) {
              setProfile(updatedProfile)
            } else {
              setProfile(profileData)
            }
          } else {
            setProfile(profileData)
          }
        }

        // Fetch matches with sets
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*, match_sets(*)')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(10)

        if (matchesData) {
          setMatches(matchesData as MatchWithSets[])
        }
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  // Calculate stats
  const totalMatches = matches.length
  const wins = matches.filter(m => m.result === 'win').length
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
        setMatches(matches.filter(m => m.id !== deleteMatchId))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setIsDeleting(false)
    setDeleteMatchId(null)
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
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
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm">{isGuest ? 'Demo Mode' : 'Welcome back'}</p>
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
                <img
                  src={profile.avatar_url}
                  alt={displayName}
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
            <div className="text-3xl font-bold">{totalMatches}</div>
            <div className="text-xs text-green-100">Matches</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-xs text-green-100">Win Rate</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold">{streak > 0 ? `🔥${streak}` : '0'}</div>
            <div className="text-xs text-green-100">Streak</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <Link
            href="/record"
            className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl p-4 transition-all"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
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
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
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
              className="text-green-600 dark:text-green-400 font-semibold mt-2 inline-block hover:underline"
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
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-2 h-12 rounded-full ${match.result === 'win' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">vs {match.opponent_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(match.played_at)}</div>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/story-card?matchId=${match.id}`} className="text-right">
                    <div className={`font-bold ${match.result === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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
