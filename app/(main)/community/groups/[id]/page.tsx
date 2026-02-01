'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Plus, Users, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { Group, Profile } from '@/lib/database.types'

type GroupMemberWithProfile = {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  profiles: Profile
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useUserStore()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members' | 'matches'>('members')
  const [isMember, setIsMember] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
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
      }

      // Fetch members with profiles
      const { data: membersData } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            skill_level
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (membersData) {
        setMembers(membersData as unknown as GroupMemberWithProfile[])

        // Check if current user is a member
        if (profile) {
          const userMembership = membersData.find(m => m.user_id === profile.id)
          setIsMember(!!userMembership)
          setIsAdmin(userMembership?.role === 'admin')
        }
      }

      setLoading(false)
    }

    fetchGroup()
  }, [groupId, profile])

  const handleJoin = async () => {
    if (!profile) return

    const supabase = createClient()
    await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
        role: 'member',
      })

    setIsMember(true)
    // Refetch members
    const { data: membersData } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          skill_level
        )
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (membersData) {
      setMembers(membersData as unknown as GroupMemberWithProfile[])
    }
  }

  const handleLeave = async () => {
    if (!profile || isAdmin) return

    const supabase = createClient()
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', profile.id)

    setIsMember(false)
    router.push('/community')
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="bg-yellow-500 h-40 animate-pulse" />
        <div className="px-6 -mt-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Group not found</p>
          <Link href="/community" className="btn-primary">
            Back to Community
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header with Cover */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-20 header-safe-area">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/community"
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {isAdmin && (
            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {group.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-yellow-800">{members.length} members • {group.is_public ? 'Public' : 'Private'}</p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'members'
                  ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'matches'
                  ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Matches
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'members' ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    href={member.profiles.username ? `/profile/${member.profiles.username}` : '#'}
                    className="flex items-center gap-3 py-2"
                  >
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
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {member.profiles.full_name || member.profiles.username}
                      </div>
                      {member.profiles.username && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">@{member.profiles.username}</div>
                      )}
                    </div>
                    {member.role === 'admin' && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No matches recorded in this group yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-6 space-y-3">
        {isMember ? (
          <>
            <Link
              href={`/record?group=${groupId}`}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Record Match in This Group
            </Link>
            {!isAdmin && (
              <button
                onClick={handleLeave}
                className="w-full py-3 text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Group
              </button>
            )}
          </>
        ) : profile ? (
          <button
            onClick={handleJoin}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join This Group
          </button>
        ) : (
          <Link href="/login" className="w-full btn-primary flex items-center justify-center gap-2">
            Login to Join
          </Link>
        )}
      </div>
    </div>
  )
}
