'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FeedItem, FeedItemSkeleton, type FeedMatch } from '@/app/(main)/dashboard/feed-item'

const PAGE_SIZE = 20

export function FeedTab() {
  const [matches, setMatches] = useState<FeedMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchFeed = async (nextCursor?: string) => {
    let query = supabase
      .from('matches')
      .select(`
        id, user_id, opponent_name, opponent_partner_name, partner_name,
        match_type, result, location, created_at, visibility,
        match_sets (set_number, player_score, opponent_score),
        profiles!matches_user_id_fkey (username, full_name, avatar_url)
      `)
      .eq('visibility', 'public')
      .in('confirmation_status', ['auto', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE + 1)

    if (nextCursor) {
      query = query.lt('created_at', nextCursor)
    }

    const { data } = await query
    if (!data) return

    const more = data.length > PAGE_SIZE
    const items = (more ? data.slice(0, PAGE_SIZE) : data) as unknown as FeedMatch[]

    if (nextCursor) {
      setMatches(prev => [...prev, ...items])
    } else {
      setMatches(items)
    }
    setCursor(more ? items[items.length - 1].created_at : null)
    setHasMore(more)
  }

  useEffect(() => {
    fetchFeed().finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => <FeedItemSkeleton key={i} />)}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">🎾</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No public matches yet. Be the first to share one!
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {matches.map((match) => (
        <FeedItem key={match.id} match={match} />
      ))}
      {hasMore && (
        <button
          onClick={async () => {
            if (!cursor || loadingMore) return
            setLoadingMore(true)
            await fetchFeed(cursor)
            setLoadingMore(false)
          }}
          disabled={loadingMore}
          className="w-full py-3 text-center text-yellow-600 dark:text-yellow-400 font-medium hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
