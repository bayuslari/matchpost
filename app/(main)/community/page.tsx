'use client'

import { useState } from 'react'
import { PlayersTab } from './players-tab'
import { GroupsTab } from './groups-tab'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'players' | 'groups'>('players')

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Community</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 flex border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'players'
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'groups'
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'players' ? <PlayersTab /> : <GroupsTab />}
    </div>
  )
}
