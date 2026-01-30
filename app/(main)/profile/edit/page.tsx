'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import type { Profile } from '@/lib/database.types'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import LocationInput from '@/components/location-input'

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { refreshProfile, updateProfile } = useUserStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'pro' | ''>('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setUsername(profileData.username || '')
        setFullName(profileData.full_name || '')
        setLocation(profileData.location || '')
        setBio(profileData.bio || '')
        setSkillLevel(profileData.skill_level || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setSuccess(false)

    // Clean username (lowercase, alphanumeric and underscore only)
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '')

    const { error } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername || null,
        full_name: fullName || null,
        location: location || null,
        bio: bio || null,
        skill_level: skillLevel === '' ? null : skillLevel,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (!error) {
      // Update the zustand store with new profile data
      updateProfile({
        username: cleanUsername || null,
        full_name: fullName || null,
        location: location || null,
        bio: bio || null,
        skill_level: skillLevel === '' ? null : skillLevel,
      })
      setSuccess(true)
      setUsername(cleanUsername)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  if (loading) {
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

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 p-4">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <svg className={`w-12 h-12 text-gray-400 ${profile?.avatar_url ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Avatar is synced from your Google account
        </p>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_username"
              className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This will be shown on your story cards. Only letters, numbers, and underscores.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <LocationInput
            value={location}
            onChange={setLocation}
            placeholder="City, Country"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Skill Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skill Level
          </label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'pro' | '')}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="">Select skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-yellow-500 text-gray-900 font-semibold py-4 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}
