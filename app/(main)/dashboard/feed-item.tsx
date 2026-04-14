'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatTimeAgo } from '@/lib/utils'

export type FeedMatch = {
  id: string
  user_id: string
  opponent_name: string
  opponent_partner_name: string | null
  partner_name: string | null
  match_type: 'singles' | 'doubles'
  result: 'win' | 'loss' | 'draw' | null
  location: string | null
  created_at: string
  visibility: 'public' | 'private'
  match_sets: { set_number: number; player_score: number; opponent_score: number }[]
  profiles: { username: string | null; full_name: string | null; avatar_url: string | null } | null
}


function formatFeedScore(sets: { set_number: number; player_score: number; opponent_score: number }[]) {
  if (!sets || sets.length === 0) return null
  return [...sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map(s => `${s.player_score}-${s.opponent_score}`)
    .join(', ')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export function FeedItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-l-4 border-l-gray-200 dark:border-l-gray-600 rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}

export function FeedItem({ match }: { match: FeedMatch }) {
  const username = match.profiles?.username
  const displayName = match.profiles?.full_name || username || 'Unknown'
  const avatarUrl = match.profiles?.avatar_url
  const score = formatFeedScore(match.match_sets)
  const ago = formatTimeAgo(match.created_at)

  const resultVerb =
    match.result === 'win' ? 'beat' :
    match.result === 'loss' ? 'lost to' :
    'drew with'

  const resultVerbColor =
    match.result === 'win' ? 'text-green-500 dark:text-green-400' :
    match.result === 'loss' ? 'text-red-500 dark:text-red-400' :
    'text-gray-500 dark:text-gray-400'

  const accentBorder =
    match.result === 'win' ? 'border-l-green-400' :
    match.result === 'loss' ? 'border-l-red-400' :
    'border-l-gray-300 dark:border-l-gray-600'

  const cardBg =
    match.result === 'win' ? 'bg-green-50 dark:bg-green-900/10' :
    match.result === 'loss' ? 'bg-red-50 dark:bg-red-900/10' :
    'bg-white dark:bg-gray-800/60'

  const scoreDot =
    match.result === 'win' ? 'bg-green-400' :
    match.result === 'loss' ? 'bg-red-400' :
    'bg-gray-400'

  const href = username ? `/profile/${username}` : null

  const inner = (
    <div className={`${cardBg} border border-gray-200 dark:border-gray-600 border-l-4 ${accentBorder} rounded-xl shadow-sm p-4 flex items-center gap-3 transition-shadow ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-yellow-500">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-gray-900">{getInitials(displayName)}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top line: result sentence */}
        <p className="text-sm leading-snug text-gray-700 dark:text-gray-200">
          <span className="font-semibold text-gray-900 dark:text-white">{displayName}</span>{' '}
          <span className={`font-medium ${resultVerbColor}`}>{resultVerb}</span>{' '}
          <span className="text-gray-700 dark:text-gray-300">{match.opponent_name}</span>
          {match.match_type === 'doubles' && match.opponent_partner_name && (
            <span className="text-gray-500 dark:text-gray-400"> &amp; {match.opponent_partner_name}</span>
          )}
        </p>

        {/* Middle line: score */}
        {score && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${scoreDot}`} />
            {score}
          </p>
        )}

        {/* Bottom line: location + time ago */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {match.location ? (
            <><span className="truncate">{match.location}</span> · {ago}</>
          ) : (
            ago
          )}
        </p>
      </div>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}
