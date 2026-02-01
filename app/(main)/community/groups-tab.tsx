'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

// Demo data - will be replaced with Supabase data
const myGroups = [
  { id: '1', name: 'Weekend Warriors', members: 12, rank: 2, icon: '⚔️' },
  { id: '2', name: 'Office League', members: 8, rank: 1, icon: '💼' },
  { id: '3', name: 'GBK Tennis Club', members: 45, rank: 15, icon: '🏟️' },
]

const discoverGroups = [
  { id: '4', name: 'Jakarta Tennis League', members: 156 },
  { id: '5', name: 'Beginners Welcome', members: 89 },
]

export function GroupsTab() {
  return (
    <div className="pb-24">
      {/* Create Button */}
      <div className="p-4 pb-0">
        <Link
          href="/community/groups/create"
          className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </Link>
      </div>

      {/* My Groups */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">MY GROUPS</h2>
        <div className="space-y-3">
          {myGroups.map((group) => (
            <Link
              key={group.id}
              href={`/community/groups/${group.id}`}
              className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all block"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-xl">
                  {group.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white">{group.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{group.members} members</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 dark:text-gray-500">Your Rank</div>
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">#{group.rank}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Discover Groups */}
      <div className="px-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">DISCOVER</h2>
        <div className="grid grid-cols-2 gap-3">
          {discoverGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg mb-2">
                🎾
              </div>
              <div className="font-semibold text-gray-800 dark:text-white text-sm">{group.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{group.members} members</div>
              <button className="w-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-semibold py-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
