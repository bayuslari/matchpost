'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/database.types'

const skillLevels = ['all', 'beginner', 'intermediate', 'advanced', 'pro'] as const
type SkillFilter = typeof skillLevels[number]

const skillLevelLabel = (level: string | null) => {
  switch (level) {
    case 'beginner': return 'Beginner'
    case 'intermediate': return 'Intermediate'
    case 'advanced': return 'Advanced'
    case 'pro': return 'Pro'
    default: return null
  }
}

const skillLevelColor = (level: string | null) => {
  switch (level) {
    case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'pro': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function PlayersTab() {
  const [players, setPlayers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all')

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (skillFilter !== 'all') {
        query = query.eq('skill_level', skillFilter)
      }

      const { data } = await query
      setPlayers(data || [])
      setLoading(false)
    }

    fetchPlayers()
  }, [skillFilter])

  return (
    <div className="p-4">
      {/* Skill Level Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        {skillLevels.map((level) => (
          <button
            key={level}
            onClick={() => setSkillFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              skillFilter === level
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {level === 'all' ? 'All Levels' : skillLevelLabel(level)}
          </button>
        ))}
      </div>

      {/* Players List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No players found</p>
          {skillFilter !== 'all' && (
            <button
              onClick={() => setSkillFilter('all')}
              className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/profile/${player.username}`}
              className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden">
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.full_name || player.username || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {(player.full_name || player.username || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 dark:text-white truncate">
                    {player.full_name || player.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{player.username}
                  </div>
                </div>

                {/* Skill Level Badge */}
                {player.skill_level && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${skillLevelColor(player.skill_level)}`}>
                    {skillLevelLabel(player.skill_level)}
                  </span>
                )}
              </div>

              {/* Location */}
              {player.location && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{player.location}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
