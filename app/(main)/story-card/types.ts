import type { Match, MatchSet, Profile } from '@/lib/database.types'

export type MatchWithSets = Match & {
  match_sets: MatchSet[]
  opponent_profile?: Profile | null
  partner_profile?: Profile | null
  opponent_partner_profile?: Profile | null
}

export interface TemplateProps {
  match: MatchWithSets
  profile: Profile | null
  stats: { winRate: number; streak: number }
  displayName: string
  backgroundImage: string | null
  hasCustomBg: boolean
  cardRef: React.RefObject<HTMLDivElement>
  formatScore: () => string
  formatDate: (dateStr: string) => string
  formatShortDate: (dateStr: string) => string
  sortedSets: MatchSet[]
}

export const templates = [
  { id: 'pro', name: 'Pro', gradient: 'from-sky-600 via-sky-500 to-cyan-400', supportsImage: false },
  { id: 'photo-pro', name: 'Photo Pro', gradient: 'from-gray-800 to-gray-900', supportsImage: true },
  { id: 'sporty', name: 'Sporty', gradient: 'from-yellow-500 via-orange-500 to-red-500', supportsImage: true },
  { id: 'dark', name: 'Dark', gradient: 'from-gray-900 via-gray-800 to-black', supportsImage: true },
  { id: 'neon', name: 'Neon', gradient: 'from-purple-600 via-pink-500 to-cyan-400', supportsImage: true },
  { id: 'minimal', name: 'Minimal', gradient: 'from-white to-gray-100', supportsImage: true },
]
