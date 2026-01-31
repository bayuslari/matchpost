'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, Plus } from 'lucide-react'

// Demo data
const topPlayers = [
  { rank: 1, name: 'Alex P. (You)', points: 580, isYou: true },
  { rank: 2, name: 'Mike S.', points: 420 },
  { rank: 3, name: 'John D.', points: 380 },
]

const otherPlayers = [
  { rank: 4, name: 'Sarah K.', points: 340, badge: '🥇' },
  { rank: 5, name: 'David R.', points: 290, badge: '🥈' },
  { rank: 6, name: 'Lisa M.', points: 250, badge: '🥈' },
  { rank: 7, name: 'Tom W.', points: 180, badge: '🥉' },
]

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  // In real app, fetch group data using params.id
  const group = {
    id: params.id,
    name: 'Weekend Warriors',
    members: 12,
    privacy: 'Public',
    icon: '⚔️',
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header with Cover */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-400 text-gray-900 px-6 pb-20 header-safe-area">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/groups"
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {group.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-yellow-800">{group.members} members • {group.privacy}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button className="flex-1 py-4 text-center font-semibold text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500">
              Leaderboard
            </button>
            <button className="flex-1 py-4 text-center font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
              Matches
            </button>
            <button className="flex-1 py-4 text-center font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
              Members
            </button>
          </div>

          {/* Leaderboard */}
          <div className="p-4">
            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 mb-6 pt-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">
                  👤
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-2 py-1 rounded-full mb-1">
                  🥈 2nd
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{topPlayers[1].name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{topPlayers[1].points} pts</div>
              </div>

              {/* 1st Place */}
              <div className="text-center -mt-4">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl ring-4 ring-yellow-400">
                  👤
                </div>
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full mb-1">
                  🥇 1st
                </div>
                <div className="text-sm font-bold text-gray-800 dark:text-white">{topPlayers[0].name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{topPlayers[0].points} pts</div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">
                  👤
                </div>
                <div className="bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded-full mb-1">
                  🥉 3rd
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{topPlayers[2].name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{topPlayers[2].points} pts</div>
              </div>
            </div>

            {/* Rest of Leaderboard */}
            <div className="space-y-2">
              {otherPlayers.map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-gray-400 dark:text-gray-500">{player.rank}</span>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{player.badge}</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{player.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Record Match in Group */}
      <div className="px-6 mt-6">
        <Link
          href="/record"
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Record Match in This Group
        </Link>
      </div>
    </div>
  )
}
