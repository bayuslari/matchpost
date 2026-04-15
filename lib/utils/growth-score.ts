export type GrowthLabel = 'Beginner' | 'Developing' | 'Competitive' | 'Advanced' | 'Elite'

export interface GrowthScoreInput {
  totalMatches: number
  winRate: number       // 0–100
  longestStreak: number
  recentMatches: number // matches in last 30 days
}

export interface GrowthScoreResult {
  score: number
  label: GrowthLabel
  breakdown: {
    activityScore: number    // max 40
    consistencyScore: number // max 20
    winScore: number         // max 30
    streakScore: number      // max 10
  }
}

export function calculateGrowthScore(input: GrowthScoreInput): GrowthScoreResult {
  const { totalMatches, winRate, longestStreak, recentMatches } = input

  const activityScore = Math.min(totalMatches / 100, 1) * 40
  const consistencyScore = Math.min(recentMatches / 10, 1) * 20
  const winScore = (winRate / 100) * 30
  const streakScore = Math.min(longestStreak / 10, 1) * 10

  const score = Math.round(activityScore + consistencyScore + winScore + streakScore)

  const label: GrowthLabel =
    score <= 20 ? 'Beginner' :
    score <= 40 ? 'Developing' :
    score <= 60 ? 'Competitive' :
    score <= 80 ? 'Advanced' :
    'Elite'

  return {
    score,
    label,
    breakdown: {
      activityScore: Math.round(activityScore),
      consistencyScore: Math.round(consistencyScore),
      winScore: Math.round(winScore),
      streakScore: Math.round(streakScore),
    },
  }
}

// Tailwind color classes per tier (for badges)
export const GROWTH_LABEL_STYLES: Record<GrowthLabel, { bg: string; text: string; darkBg: string; darkText: string }> = {
  Beginner:    { bg: 'bg-gray-100',   text: 'text-gray-600',   darkBg: 'dark:bg-gray-700',   darkText: 'dark:text-gray-300' },
  Developing:  { bg: 'bg-blue-100',   text: 'text-blue-600',   darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-300' },
  Competitive: { bg: 'bg-green-100',  text: 'text-green-600',  darkBg: 'dark:bg-green-900/40', darkText: 'dark:text-green-300' },
  Advanced:    { bg: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-300' },
  Elite:       { bg: 'bg-yellow-100', text: 'text-yellow-700', darkBg: 'dark:bg-yellow-900/40', darkText: 'dark:text-yellow-300' },
}
