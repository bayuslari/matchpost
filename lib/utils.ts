import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatScore(sets: { player: number; opponent: number }[]): string {
  return sets.map(set => `${set.player}-${set.opponent}`).join(', ')
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays === 1) return 'kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
