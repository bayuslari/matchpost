'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Lock, Users, LogIn, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { EmojiPicker } from '@/components/emoji-picker'

export default function CreateGroupPage() {
  const router = useRouter()
  const { profile, isLoading, initialize } = useUserStore()

  useEffect(() => {
    initialize()
  }, [initialize])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🎾')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = async () => {
    if (!profile) {
      setError('You must be logged in to create a group')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description: description || null,
        icon,
        is_public: privacy === 'public',
        created_by: profile.id,
      })
      .select()
      .single()

    if (groupError) {
      setError(groupError.message)
      setLoading(false)
      return
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: profile.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('Failed to add creator as member:', memberError)
      // Don't block - group was created successfully
    }

    setLoading(false)
    router.push(`/community/groups/${group.id}`)
  }

  // Show loading while initializing
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <Link
            href="/community"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Group</h1>
        </div>
        <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100dvh - 120px)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <Link
            href="/community"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Group</h1>
        </div>

        <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100dvh - 120px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Create Your Group</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Login to create a group and start connecting with other tennis players in your community.
            </p>
            <Link
              href="/login?next=/community/groups/create"
              className="w-full btn-primary inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <Link
          href="/community"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Group</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Group Icon */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(true)}
            className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all"
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400">Change</span>
          </button>
        </div>

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <EmojiPicker
            selectedEmoji={icon}
            onSelect={setIcon}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

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
              type="button"
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
              type="button"
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name || loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  )
}
