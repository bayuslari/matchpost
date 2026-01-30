'use client'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

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

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Groups</h1>
        </div>
        <Link 
          href="/groups/create"
          className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 hover:bg-green-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create
        </Link>
      </div>

      {/* My Groups */}
      <div className="p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">MY GROUPS</h2>
        <div className="space-y-3">
          {myGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all block"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-xl">
                  {group.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{group.name}</div>
                  <div className="text-sm text-gray-500">{group.members} members</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Your Rank</div>
                <div className="text-xl font-bold text-green-600">#{group.rank}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Discover Groups */}
      <div className="px-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">DISCOVER</h2>
        <div className="grid grid-cols-2 gap-3">
          {discoverGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg mb-2">
                🎾
              </div>
              <div className="font-semibold text-gray-800 text-sm">{group.name}</div>
              <div className="text-xs text-gray-500 mb-3">{group.members} members</div>
              <button className="w-full bg-green-50 text-green-600 text-sm font-semibold py-2 rounded-lg hover:bg-green-100 transition-all">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
