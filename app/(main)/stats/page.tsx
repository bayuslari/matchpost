'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp, Target, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type MonthlyData = {
  month: string
  wins: number
  losses: number
}

export default function StatsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch all matches
      const { data: matches } = await supabase
        .from('matches')
        .select('result, played_at')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      if (matches) {
        const totalMatches = matches.length
        const wins = matches.filter(m => m.result === 'win').length
        const losses = matches.filter(m => m.result === 'loss').length
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

        // Calculate current streak
        let currentStreak = 0
        for (const match of matches) {
          if (match.result === 'win') {
            currentStreak++
          } else {
            break
          }
        }

        // Calculate longest streak
        let longestStreak = 0
        let tempStreak = 0
        // Sort by date ascending for longest streak calculation
        const sortedMatches = [...matches].sort((a, b) =>
          new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
        )
        for (const match of sortedMatches) {
          if (match.result === 'win') {
            tempStreak++
            longestStreak = Math.max(longestStreak, tempStreak)
          } else {
            tempStreak = 0
          }
        }

        setStats({
          totalMatches,
          wins,
          losses,
          winRate,
          currentStreak,
          longestStreak,
        })

        // Calculate monthly data (last 4 months)
        const monthlyMap = new Map<string, { wins: number; losses: number }>()
        const now = new Date()

        // Initialize last 4 months
        for (let i = 3; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const key = date.toLocaleDateString('en-US', { month: 'short' })
          monthlyMap.set(key, { wins: 0, losses: 0 })
        }

        // Count matches per month
        for (const match of matches) {
          const matchDate = new Date(match.played_at)
          const monthKey = matchDate.toLocaleDateString('en-US', { month: 'short' })

          if (monthlyMap.has(monthKey)) {
            const current = monthlyMap.get(monthKey)!
            if (match.result === 'win') {
              current.wins++
            } else if (match.result === 'loss') {
              current.losses++
            }
          }
        }

        const monthlyArray: MonthlyData[] = []
        monthlyMap.forEach((value, key) => {
          monthlyArray.push({ month: key, ...value })
        })
        setMonthlyData(monthlyArray)
      }

      setLoading(false)
    }

    loadStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const maxMonthlyValue = Math.max(
    ...monthlyData.map(d => d.wins + d.losses),
    1
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="p-1 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Statistics</h1>
        </div>
        <p className="text-green-100 ml-9">Your tennis journey in numbers</p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Total Matches</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalMatches}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.winRate}%</div>
          </div>
        </div>

        {/* Win/Loss Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Win / Loss</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">{stats.wins} Wins</span>
                <span className="text-red-500 font-medium">{stats.losses} Losses</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                {stats.totalMatches > 0 ? (
                  <>
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${stats.winRate}%` }}
                    ></div>
                    <div
                      className="bg-red-400 h-full"
                      style={{ width: `${100 - stats.winRate}%` }}
                    ></div>
                  </>
                ) : (
                  <div className="bg-gray-200 h-full w-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Streaks</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-orange-500">
                {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Longest Streak</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.longestStreak > 0 ? `🏆 ${stats.longestStreak}` : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Performance</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
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
                            className="w-full bg-green-500 rounded-t"
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
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-500">Wins</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-gray-500">Losses</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">No match data yet</p>
              <Link href="/record" className="text-green-600 text-sm hover:underline">
                Record your first match
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
