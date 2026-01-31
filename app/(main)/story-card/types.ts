import type { Match, MatchSet, Profile } from '@/lib/database.types'

export type MatchWithSets = Match & {
  match_sets: MatchSet[]
  opponent_profile?: Profile | null
  partner_profile?: Profile | null
  opponent_partner_profile?: Profile | null
}

export type NameDisplayMode = 'username' | 'fullname'

export interface TemplateProps {
  match: MatchWithSets
  profile: Profile | null
  stats: { winRate: number; streak: number }
  displayName: string
  nameDisplayMode: NameDisplayMode
  backgroundImage: string | null
  hasCustomBg: boolean
  cardRef: React.RefObject<HTMLDivElement>
  formatScore: () => string
  formatDate: (dateStr: string) => string
  formatShortDate: (dateStr: string) => string
  sortedSets: MatchSet[]
}

// Helper function to format profile name based on display mode
export function formatProfileName(
  linkedProfile: Profile | null | undefined,
  fallbackName: string | null | undefined,
  defaultLabel: string,
  nameDisplayMode: NameDisplayMode
): string {
  if (!linkedProfile) {
    return fallbackName || defaultLabel
  }

  if (nameDisplayMode === 'username' && linkedProfile.username) {
    return `@${linkedProfile.username}`
  }

  return linkedProfile.full_name || linkedProfile.username || fallbackName || defaultLabel
}

export const templates = [
  { id: 'pro', name: 'Pro', gradient: 'from-sky-600 via-sky-500 to-cyan-400', supportsImage: false },
  { id: 'photo-pro', name: 'Photo Pro', gradient: 'from-gray-800 to-gray-900', supportsImage: true },
  { id: 'dark', name: 'Dark', gradient: 'from-gray-900 via-gray-800 to-black', supportsImage: true },
  { id: 'minimal', name: 'Minimal', gradient: 'from-amber-700 via-orange-800 to-amber-900', supportsImage: true },
]
