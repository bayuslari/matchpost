import type { MatchSet } from '@/lib/database.types'

/**
 * Returns true if a loss was a close, competitive match worth sharing.
 * Conditions (any one qualifies):
 * - Any set went to tiebreak
 * - The player won at least one set
 * - Score difference in any set is 2 or fewer games (e.g. 5-7, 4-6)
 */
export function isToughMatch(matchSets: MatchSet[]): boolean {
  if (!matchSets || matchSets.length === 0) return false

  for (const set of matchSets) {
    // Any set went to tiebreak
    if (set.tiebreak_player !== null || set.tiebreak_opponent !== null) {
      return true
    }

    // Player won this set
    if (set.player_score > set.opponent_score) {
      return true
    }

    // Score difference is 2 or fewer
    if (Math.abs(set.player_score - set.opponent_score) <= 2) {
      return true
    }
  }

  return false
}
