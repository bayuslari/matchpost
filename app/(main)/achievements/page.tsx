'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { useUserStore } from '@/lib/stores/user-store'
import { ACHIEVEMENT_CATEGORIES, type AchievementCategory } from '@/lib/achievements'

const CATEGORY_ORDER: AchievementCategory[] = ['milestone', 'streak', 'match_type', 'social']

const CATEGORY_BG: Record<AchievementCategory, string> = {
  milestone:  'bg-yellow-100 dark:bg-yellow-900/30',
  streak:     'bg-orange-100 dark:bg-orange-900/30',
  match_type: 'bg-blue-100 dark:bg-blue-900/30',
  social:     'bg-green-100 dark:bg-green-900/30',
}

const CATEGORY_TEXT: Record<AchievementCategory, string> = {
  milestone:  'text-yellow-700 dark:text-yellow-300',
  streak:     'text-orange-700 dark:text-orange-300',
  match_type: 'text-blue-700 dark:text-blue-300',
  social:     'text-green-700 dark:text-green-300',
}

const CATEGORY_PROGRESS: Record<AchievementCategory, string> = {
  milestone:  'bg-yellow-400',
  streak:     'bg-orange-400',
  match_type: 'bg-blue-400',
  social:     'bg-green-400',
}

export default function AchievementsPage() {
  const { achievements, stats, isLoading, initialize } = useUserStore()
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all')

  useEffect(() => {
    initialize()
  }, [initialize])

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  const grouped = CATEGORY_ORDER.reduce<Record<AchievementCategory, typeof achievements>>(
    (acc, cat) => {
      acc[cat] = achievements.filter(a => a.category === cat)
      return acc
    },
    {} as Record<AchievementCategory, typeof achievements>
  )

  const filteredAchievements =
    activeCategory === 'all'
      ? achievements
      : achievements.filter(a => a.category === activeCategory)

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-6">
        <div className="text-4xl font-outfit font-black tracking-tight">
          <span className="text-yellow-500 animate-pulse">MATCH</span>
          <span className="text-gray-800 dark:text-white">POST</span>
        </div>
        <div className="w-48 space-y-2">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full animate-loading-bar"></div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-8 header-safe-area">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/profile" className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Achievements</h1>
        </div>
        <p className="text-yellow-800 ml-9">
          {unlockedCount} of {totalCount} unlocked
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Overall progress card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800 dark:text-white">Overall Progress</span>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Category mini stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {CATEGORY_ORDER.map(cat => {
              const items = grouped[cat]
              const unlocked = items.filter(a => a.unlocked).length
              return (
                <div key={cat} className="text-center">
                  <div className={`text-sm font-bold ${CATEGORY_TEXT[cat]}`}>
                    {unlocked}/{items.length}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                    {cat === 'match_type' ? 'Types' : ACHIEVEMENT_CATEGORIES[cat].label.split(' ')[0]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All
          </button>
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {ACHIEVEMENT_CATEGORIES[cat].label}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-all ${
                achievement.unlocked ? '' : 'opacity-60'
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${CATEGORY_BG[achievement.category]} flex items-center justify-center text-2xl mb-3 relative`}>
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <span className="grayscale opacity-50">{achievement.icon}</span>
                )}
                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px]">✓</span>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="font-semibold text-sm text-gray-800 dark:text-white leading-tight mb-0.5">
                {achievement.title}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight mb-3">
                {achievement.description}
              </div>

              {/* Progress bar (only for locked achievements) */}
              {!achievement.unlocked && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progressLabel}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CATEGORY_PROGRESS[achievement.category]} rounded-full transition-all duration-500`}
                      style={{ width: `${achievement.progress * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Unlocked label */}
              {achievement.unlocked && (
                <div className={`text-xs font-semibold ${CATEGORY_TEXT[achievement.category]}`}>
                  Unlocked ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No achievements here yet</p>
            <p className="text-sm mt-1">Keep playing to unlock them</p>
          </div>
        )}

        {/* Motivation footer */}
        {stats.totalMatches === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Record your first match to start earning achievements! 🎾
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
