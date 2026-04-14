'use client'

import Image from 'next/image'
import Link from 'next/link'

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

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function formatFeedScore(sets: { set_number: number; player_score: number; opponent_score: number }[]) {
  if (!sets || sets.length === 0) return null
  return [...sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map(s => `${s.player_score}-${s.opponent_score}`)
    .join(', ')
}

export function FeedItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="text-right flex-shrink-0">
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}

export function FeedItem({ match }: { match: FeedMatch }) {
  const username = match.profiles?.username
  const displayName = match.profiles?.full_name || username || 'Unknown'
  const avatarUrl = match.profiles?.avatar_url
  const score = formatFeedScore(match.match_sets)
  const ago = timeAgo(match.created_at)

  const resultLabel =
    match.result === 'win' ? 'beat' :
    match.result === 'loss' ? 'lost to' :
    'drew with'

  const resultBadgeColor =
    match.result === 'win' ? 'text-yellow-600 dark:text-yellow-400' :
    match.result === 'loss' ? 'text-red-500 dark:text-red-400' :
    'text-gray-500 dark:text-gray-400'

  const resultBadgeText =
    match.result === 'win' ? 'WIN' :
    match.result === 'loss' ? 'LOSS' :
    'DRAW'

  const barColor =
    match.result === 'win' ? 'bg-yellow-500' :
    match.result === 'loss' ? 'bg-red-400' :
    'bg-gray-400'

  return (
    <Link href={`/story-card?matchId=${match.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </div>

        {/* Result bar */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${barColor}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {username ? (
              <span
                onClick={(e) => { e.preventDefault(); window.location.href = `/profile/${username}` }}
                className="hover:text-yellow-600 dark:hover:text-yellow-400 cursor-pointer"
              >
                {displayName}
              </span>
            ) : (
              displayName
            )}{' '}
            <span className="font-normal text-gray-500 dark:text-gray-400">{resultLabel}</span>{' '}
            <span className="font-semibold">{match.opponent_name}</span>
            {match.match_type === 'doubles' && match.opponent_partner_name && (
              <span className="font-normal text-gray-500 dark:text-gray-400"> &amp; {match.opponent_partner_name}</span>
            )}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
            {score && <span>{score}</span>}
            {score && (match.location || ago) && <span>·</span>}
            {match.location && <span className="truncate max-w-[100px]">{match.location}</span>}
            {match.location && ago && <span>·</span>}
            <span>{ago}</span>
          </div>
        </div>

        {/* Result badge */}
        <div className={`text-sm font-bold flex-shrink-0 ${resultBadgeColor}`}>
          {resultBadgeText}
        </div>
      </div>
    </Link>
  )
}
