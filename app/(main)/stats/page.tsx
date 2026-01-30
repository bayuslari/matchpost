'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp, Target, ArrowLeft } from 'lucide-react'
import { useUserStore } from '@/lib/stores/user-store'

export default function StatsPage() {
  const { stats, isLoading, initialize } = useUserStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-6">
        {/* Animated Logo */}
        <div className="text-4xl font-outfit font-black tracking-tight">
          <span className="text-yellow-500 animate-pulse">MATCH</span>
          <span className="text-gray-800 dark:text-white">POST</span>
        </div>

        {/* Progress Bar */}
        <div className="w-48 space-y-2">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full animate-loading-bar"></div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  const { monthlyData } = stats
  const maxMonthlyValue = Math.max(
    ...monthlyData.map(d => d.wins + d.losses),
    1
  )

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 p-6 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="p-1 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Statistics</h1>
        </div>
        <p className="text-yellow-800 ml-9">Your tennis journey in numbers</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Total Matches</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalMatches}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.winRate}%</div>
          </div>
        </div>

        {/* Win/Loss Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Win / Loss</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">{stats.wins} Wins</span>
                <span className="text-red-500 dark:text-red-400 font-medium">{stats.losses} Losses</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                {stats.totalMatches > 0 ? (
                  <>
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${stats.winRate}%` }}
                    ></div>
                    <div
                      className="bg-red-400 h-full"
                      style={{ width: `${100 - stats.winRate}%` }}
                    ></div>
                  </>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-600 h-full w-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Streaks</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                {stats.streak > 0 ? `🔥 ${stats.streak}` : '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Longest Streak</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.longestStreak > 0 ? `🏆 ${stats.longestStreak}` : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Monthly Performance</h3>
            <TrendingUp className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          </div>

          {monthlyData.length > 0 && monthlyData.some(d => d.wins > 0 || d.losses > 0) ? (
            <>
              <div className="flex items-end justify-between gap-2 h-32">
                {monthlyData.map((data) => {
                  const totalHeight = ((data.wins + data.losses) / maxMonthlyValue) * 100
                  const winsHeight = data.wins + data.losses > 0
                    ? (data.wins / (data.wins + data.losses)) * totalHeight
                    : 0
                  const lossesHeight = totalHeight - winsHeight

                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                        {data.wins > 0 && (
                          <div
                            className="w-full bg-yellow-500 rounded-t"
                            style={{ height: `${winsHeight}%` }}
                          ></div>
                        )}
                        {data.losses > 0 && (
                          <div
                            className="w-full bg-red-400 rounded-b"
                            style={{ height: `${lossesHeight}%` }}
                          ></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{data.month}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-500 dark:text-gray-400">Wins</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-gray-500 dark:text-gray-400">Losses</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">No match data yet</p>
              <Link href="/record" className="text-yellow-600 dark:text-yellow-400 text-sm hover:underline">
                Record your first match
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
