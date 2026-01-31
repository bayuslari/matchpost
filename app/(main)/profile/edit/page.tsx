'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { trackEvent } from '@/lib/analytics'
import { compressImage, isValidImageType, formatFileSize, MAX_ORIGINAL_SIZE } from '@/lib/image-utils'
import type { Profile } from '@/lib/database.types'
import { ArrowLeft, Loader2, Check, Camera, X } from 'lucide-react'
import LocationInput from '@/components/location-input'

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { refreshProfile, updateProfile } = useUserStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')

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
      trackEvent('update_profile')
      setSuccess(true)
      setUsername(cleanUsername)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setAvatarError('')

    // Validate file type
    if (!isValidImageType(file)) {
      setAvatarError('Please select a valid image (JPG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (max 5MB before compression)
    if (file.size > MAX_ORIGINAL_SIZE) {
      setAvatarError(`Image too large. Max ${formatFileSize(MAX_ORIGINAL_SIZE)} allowed.`)
      return
    }

    setUploadingAvatar(true)

    try {
      // Compress image
      const { blob } = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        maxSizeKB: 200,
      })

      // Create preview
      const previewUrl = URL.createObjectURL(blob)
      setAvatarPreview(previewUrl)

      // Upload to Supabase Storage
      const fileName = `${profile.id}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setAvatarError('Failed to upload image. Please try again.')
        setAvatarPreview(null)
        setUploadingAvatar(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        setAvatarError('Failed to update profile. Please try again.')
      } else {
        // Update local state and store
        setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
        updateProfile({ avatar_url: publicUrl })
        trackEvent('upload_avatar')
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      setAvatarError('Failed to process image. Please try again.')
      setAvatarPreview(null)
    }

    setUploadingAvatar(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return

    setUploadingAvatar(true)

    try {
      // Update profile to remove avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, avatar_url: null } : null)
        updateProfile({ avatar_url: null })
        setAvatarPreview(null)
      }
    } catch (err) {
      console.error('Remove avatar error:', err)
    }

    setUploadingAvatar(false)
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
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 px-4 pb-4 header-safe-area">
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
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : avatarPreview || profile?.avatar_url ? (
                <Image
                  src={avatarPreview || profile?.avatar_url || ''}
                  alt=""
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>

            {/* Camera button overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-gray-900" />
            </button>

            {/* Remove button (only show if has avatar) */}
            {(profile?.avatar_url || avatarPreview) && !uploadingAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
          />

          {/* Error message */}
          {avatarError && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">
              {avatarError}
            </p>
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Tap camera to change photo (max 5MB, will be resized to 400x400)
          </p>
        </div>

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
