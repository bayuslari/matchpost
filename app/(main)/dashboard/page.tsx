'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match, MatchSet } from '@/lib/database.types'

type MatchWithSets = Match & { match_sets: MatchSet[] }

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchWithSets[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
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

  const displayName = profile?.full_name || profile?.username || 'Player'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold">{displayName} 👋</h1>
          </div>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🎾
            </div>
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
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-2 gap-3">
          <Link
            href="/record"
            className="flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 rounded-xl p-4 transition-all"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-700">New Match</span>
          </Link>
          <Link
            href="/groups"
            className="flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-all"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-700">Groups</span>
          </Link>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="px-6 mt-6 pb-24">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Matches</h2>
        {matches.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🎾</div>
            <p className="text-gray-500">No matches yet</p>
            <Link
              href="/record"
              className="text-green-600 font-semibold mt-2 inline-block hover:underline"
            >
              Record your first match →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/story-card?matchId=${match.id}`}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-12 rounded-full ${match.result === 'win' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                  <div>
                    <div className="font-semibold text-gray-800">vs {match.opponent_name}</div>
                    <div className="text-sm text-gray-500">{formatDate(match.played_at)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${match.result === 'win' ? 'text-green-600' : 'text-red-500'}`}>
                    {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
                  </div>
                  <div className="text-sm text-gray-500">{formatScore(match.match_sets)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
