'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Trash2, Globe, Lock, Loader2, UserMinus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { Group, Profile } from '@/lib/database.types'
import { EmojiPicker } from '@/components/emoji-picker'

type GroupMemberWithProfile = {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  profiles: Profile
}

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useUserStore()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🎾')
  const [isPublic, setIsPublic] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
      if (!profile) return

      setLoading(true)
      const supabase = createClient()

      // Fetch group details
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupData) {
        setGroup(groupData)
        setName(groupData.name)
        setDescription(groupData.description || '')
        setIcon(groupData.icon)
        setIsPublic(groupData.is_public)
      }

      // Fetch members
      const { data: membersData } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (*)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (membersData) {
        setMembers(membersData as unknown as GroupMemberWithProfile[])
        const userMembership = membersData.find(m => m.user_id === profile.id)
        setIsAdmin(userMembership?.role === 'admin')
      }

      setLoading(false)
    }

    fetchGroup()
  }, [groupId, profile])

  const handleSave = async () => {
    if (!group || saving) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('groups')
      .update({
        name,
        description: description || null,
        icon,
        is_public: isPublic,
      })
      .eq('id', groupId)

    if (error) {
      console.error('Failed to update group:', error)
    } else {
      setGroup({ ...group, name, description, icon, is_public: isPublic })
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!group || deleting) return

    setDeleting(true)
    const supabase = createClient()

    // Delete all members first (cascade should handle this, but just in case)
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)

    // Delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (error) {
      console.error('Failed to delete group:', error)
      setDeleting(false)
      return
    }

    router.push('/community')
  }

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === profile?.id) return // Can't remove yourself

    setRemovingMemberId(memberId)
    const supabase = createClient()

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Failed to remove member:', error)
    } else {
      setMembers(prev => prev.filter(m => m.id !== memberId))
    }

    setRemovingMemberId(null)
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!group || !isAdmin) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {!group ? 'Group not found' : 'You must be an admin to access settings'}
          </p>
          <Link href="/community" className="btn-primary">
            Back to Community
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <Link
          href={`/community/groups/${groupId}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Group Settings</h1>
      </div>

      <div className="p-6 space-y-6">
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
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Enter group name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="Tell us about your group..."
          />
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Privacy
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`py-4 px-4 font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                isPublic
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Public</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`py-4 px-4 font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                !isPublic
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Members Management */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Manage Members ({members.length})
          </h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden">
                    {member.profiles.avatar_url ? (
                      <img
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {(member.profiles.full_name || member.profiles.username || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {member.profiles.full_name || member.profiles.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                </div>

                {member.user_id !== profile?.id && member.role !== 'admin' && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                    disabled={removingMemberId === member.id}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-50"
                  >
                    {removingMemberId === member.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserMinus className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Group
            </button>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                Are you sure you want to delete this group? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
