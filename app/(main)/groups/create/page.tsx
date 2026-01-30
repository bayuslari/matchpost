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
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-4">
        <Link 
          href="/groups"
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Create Group</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Group Icon */}
        <div className="flex justify-center">
          <button className="w-24 h-24 bg-green-100 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-green-300 hover:bg-green-200 transition-all">
            <span className="text-3xl">🎾</span>
            <span className="text-xs text-green-600">Change</span>
          </button>
        </div>

        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Group Name</label>
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Description (optional)</label>
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Privacy</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPrivacy('public')}
              className={`py-4 px-4 font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                privacy === 'public' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Ranking Reset</label>
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
