export type AchievementCategory = 'milestone' | 'streak' | 'match_type' | 'social'

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  unlocked: boolean
  progress: number       // 0.0 → 1.0
  progressLabel: string  // e.g. "7 / 10"
}

// Minimal shape we need from the store's MatchWithSets
type MatchLike = {
  match_type: string | null
  result: string | null
  opponent_user_id?: string | null
  isOwner?: boolean
}

type AchievementData = {
  matches: MatchLike[]
  wins: number
  losses: number
  totalMatches: number
  streak: number
  longestStreak: number
}

type AchievementDef = {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  check: (data: AchievementData) => { unlocked: boolean; progress: number; progressLabel: string }
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ─── First Actions ──────────────────────────────────────────
  {
    id: 'first_match',
    title: 'First Serve',
    description: 'Record your very first match',
    icon: '🎾',
    category: 'milestone',
    check: ({ totalMatches }) => ({
      unlocked: totalMatches >= 1,
      progress: Math.min(totalMatches, 1),
      progressLabel: `${Math.min(totalMatches, 1)} / 1`,
    }),
  },
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Win your first match',
    icon: '🏆',
    category: 'milestone',
    check: ({ wins }) => ({
      unlocked: wins >= 1,
      progress: Math.min(wins, 1),
      progressLabel: `${Math.min(wins, 1)} / 1`,
    }),
  },

  // ─── Match Count ─────────────────────────────────────────────
  {
    id: 'matches_10',
    title: 'Court Regular',
    description: 'Record 10 matches',
    icon: '📋',
    category: 'milestone',
    check: ({ totalMatches }) => ({
      unlocked: totalMatches >= 10,
      progress: Math.min(totalMatches / 10, 1),
      progressLabel: `${Math.min(totalMatches, 10)} / 10`,
    }),
  },
  {
    id: 'matches_25',
    title: 'Dedicated Player',
    description: 'Record 25 matches',
    icon: '📊',
    category: 'milestone',
    check: ({ totalMatches }) => ({
      unlocked: totalMatches >= 25,
      progress: Math.min(totalMatches / 25, 1),
      progressLabel: `${Math.min(totalMatches, 25)} / 25`,
    }),
  },
  {
    id: 'matches_50',
    title: 'Tennis Devotee',
    description: 'Record 50 matches',
    icon: '🎽',
    category: 'milestone',
    check: ({ totalMatches }) => ({
      unlocked: totalMatches >= 50,
      progress: Math.min(totalMatches / 50, 1),
      progressLabel: `${Math.min(totalMatches, 50)} / 50`,
    }),
  },
  {
    id: 'matches_100',
    title: 'Century Club',
    description: 'Record 100 matches',
    icon: '💯',
    category: 'milestone',
    check: ({ totalMatches }) => ({
      unlocked: totalMatches >= 100,
      progress: Math.min(totalMatches / 100, 1),
      progressLabel: `${Math.min(totalMatches, 100)} / 100`,
    }),
  },

  // ─── Win Count ───────────────────────────────────────────────
  {
    id: 'wins_5',
    title: 'On the Board',
    description: 'Get 5 wins',
    icon: '⭐',
    category: 'milestone',
    check: ({ wins }) => ({
      unlocked: wins >= 5,
      progress: Math.min(wins / 5, 1),
      progressLabel: `${Math.min(wins, 5)} / 5`,
    }),
  },
  {
    id: 'wins_10',
    title: 'Match Winner',
    description: 'Get 10 wins',
    icon: '🌟',
    category: 'milestone',
    check: ({ wins }) => ({
      unlocked: wins >= 10,
      progress: Math.min(wins / 10, 1),
      progressLabel: `${Math.min(wins, 10)} / 10`,
    }),
  },
  {
    id: 'wins_25',
    title: 'Dominator',
    description: 'Get 25 wins',
    icon: '💪',
    category: 'milestone',
    check: ({ wins }) => ({
      unlocked: wins >= 25,
      progress: Math.min(wins / 25, 1),
      progressLabel: `${Math.min(wins, 25)} / 25`,
    }),
  },
  {
    id: 'wins_50',
    title: 'Champion',
    description: 'Get 50 wins',
    icon: '👑',
    category: 'milestone',
    check: ({ wins }) => ({
      unlocked: wins >= 50,
      progress: Math.min(wins / 50, 1),
      progressLabel: `${Math.min(wins, 50)} / 50`,
    }),
  },

  // ─── Streaks ──────────────────────────────────────────────────
  {
    id: 'streak_3',
    title: 'Hot Streak',
    description: 'Win 3 matches in a row',
    icon: '🔥',
    category: 'streak',
    check: ({ longestStreak }) => ({
      unlocked: longestStreak >= 3,
      progress: Math.min(longestStreak / 3, 1),
      progressLabel: `${Math.min(longestStreak, 3)} / 3`,
    }),
  },
  {
    id: 'streak_5',
    title: 'On Fire',
    description: 'Win 5 matches in a row',
    icon: '🔥',
    category: 'streak',
    check: ({ longestStreak }) => ({
      unlocked: longestStreak >= 5,
      progress: Math.min(longestStreak / 5, 1),
      progressLabel: `${Math.min(longestStreak, 5)} / 5`,
    }),
  },
  {
    id: 'streak_10',
    title: 'Unstoppable',
    description: 'Win 10 matches in a row',
    icon: '⚡',
    category: 'streak',
    check: ({ longestStreak }) => ({
      unlocked: longestStreak >= 10,
      progress: Math.min(longestStreak / 10, 1),
      progressLabel: `${Math.min(longestStreak, 10)} / 10`,
    }),
  },

  // ─── Match Type ───────────────────────────────────────────────
  {
    id: 'doubles_debut',
    title: 'Team Spirit',
    description: 'Play your first doubles match',
    icon: '🤝',
    category: 'match_type',
    check: ({ matches }) => {
      const count = matches.filter(m => m.match_type === 'doubles').length
      return {
        unlocked: count >= 1,
        progress: Math.min(count, 1),
        progressLabel: `${Math.min(count, 1)} / 1`,
      }
    },
  },
  {
    id: 'singles_10',
    title: 'Solo Warrior',
    description: 'Play 10 singles matches',
    icon: '🎯',
    category: 'match_type',
    check: ({ matches }) => {
      const count = matches.filter(m => m.match_type === 'singles').length
      return {
        unlocked: count >= 10,
        progress: Math.min(count / 10, 1),
        progressLabel: `${Math.min(count, 10)} / 10`,
      }
    },
  },
  {
    id: 'doubles_10',
    title: 'Dynamic Duo',
    description: 'Play 10 doubles matches',
    icon: '👥',
    category: 'match_type',
    check: ({ matches }) => {
      const count = matches.filter(m => m.match_type === 'doubles').length
      return {
        unlocked: count >= 10,
        progress: Math.min(count / 10, 1),
        progressLabel: `${Math.min(count, 10)} / 10`,
      }
    },
  },

  // ─── Social ───────────────────────────────────────────────────
  {
    id: 'unique_opponents_5',
    title: 'Well Connected',
    description: 'Play against 5 different linked opponents',
    icon: '🌐',
    category: 'social',
    check: ({ matches }) => {
      const uniqueOpponents = new Set(
        matches
          .filter(m => m.isOwner && m.opponent_user_id)
          .map(m => m.opponent_user_id)
      )
      const count = uniqueOpponents.size
      return {
        unlocked: count >= 5,
        progress: Math.min(count / 5, 1),
        progressLabel: `${Math.min(count, 5)} / 5`,
      }
    },
  },
]

export function calculateAchievements(
  matches: MatchLike[],
  stats: Pick<AchievementData, 'wins' | 'losses' | 'totalMatches' | 'streak' | 'longestStreak'>
): Achievement[] {
  const data: AchievementData = { matches, ...stats }

  return ACHIEVEMENT_DEFS.map(def => {
    const result = def.check(data)
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      unlocked: result.unlocked,
      progress: result.progress,
      progressLabel: result.progressLabel,
    }
  })
}

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { label: string; color: string }> = {
  milestone: { label: 'Milestones', color: 'yellow' },
  streak:    { label: 'Streaks',    color: 'orange' },
  match_type:{ label: 'Match Types',color: 'blue'   },
  social:    { label: 'Social',     color: 'green'  },
}

export const SEEN_ACHIEVEMENTS_KEY = 'matchpost_seen_achievements'
