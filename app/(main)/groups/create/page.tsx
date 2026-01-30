'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Lock } from 'lucide-react'

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [rankingReset, setRankingReset] = useState('monthly')

  const handleSubmit = () => {
    // TODO: Save to Supabase
    const groupData = {
      name,
      description,
      privacy,
      rankingReset,
    }
    console.log('Group data:', groupData)
    router.push('/groups')
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <Link
          href="/groups"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Group</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Group Icon */}
        <div className="flex justify-center">
          <button className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all">
            <span className="text-3xl">🎾</span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400">Change</span>
          </button>
        </div>

        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Group Name</label>
          <input
            type="text"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Description (optional)</label>
          <textarea
            placeholder="Tell us about your group..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
          />
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Privacy</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPrivacy('public')}
              className={`py-4 px-4 font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                privacy === 'public'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Public</span>
              <span className={`text-xs font-normal ${privacy === 'public' ? 'opacity-80' : 'opacity-60'}`}>
                Anyone can join
              </span>
            </button>
            <button
              onClick={() => setPrivacy('private')}
              className={`py-4 px-4 font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                privacy === 'private'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Private</span>
              <span className={`text-xs font-normal ${privacy === 'private' ? 'opacity-80' : 'opacity-60'}`}>
                Request to join
              </span>
            </button>
          </div>
        </div>

        {/* Season Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Ranking Reset</label>
          <select
            value={rankingReset}
            onChange={(e) => setRankingReset(e.target.value)}
            className="input"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="never">Never</option>
          </select>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Group
        </button>
      </div>
    </div>
  )
}
