'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/lib/stores/user-store'
import type { Achievement } from '@/lib/achievements'

export function AchievementToast() {
  const { pendingAchievements, clearPendingAchievements } = useUserStore()
  const [current, setCurrent] = useState<Achievement | null>(null)
  const [visible, setVisible] = useState(false)
  const [queue, setQueue] = useState<Achievement[]>([])

  // Load pending achievements into local queue when they arrive
  useEffect(() => {
    if (pendingAchievements.length > 0) {
      setQueue(prev => {
        const existingIds = new Set(prev.map(a => a.id))
        const newOnes = pendingAchievements.filter(a => !existingIds.has(a.id))
        return [...prev, ...newOnes]
      })
      clearPendingAchievements()
    }
  }, [pendingAchievements, clearPendingAchievements])

  // Process queue one at a time
  useEffect(() => {
    if (current || queue.length === 0) return

    const [next, ...rest] = queue
    setQueue(rest)
    setCurrent(next)

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })

    // Auto dismiss after 3.5s
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setCurrent(null), 400) // wait for exit animation
    }, 3500)

    return () => clearTimeout(timer)
  }, [queue, current])

  if (!current) return null

  return (
    <div
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Icon badge */}
        <div className="w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center text-2xl flex-shrink-0">
          {current.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400 dark:text-yellow-600 mb-0.5">
            Achievement Unlocked!
          </div>
          <div className="font-bold text-sm leading-tight truncate">{current.title}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{current.description}</div>
        </div>

        {/* Trophy emoji */}
        <div className="text-xl flex-shrink-0">🏆</div>
      </div>
    </div>
  )
}
