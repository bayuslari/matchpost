'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { Group } from '@/lib/database.types'

type GroupWithMemberCount = Group & { member_count: number; user_rank?: number }

export function GroupsTab() {
  const { profile } = useUserStore()
  const [myGroups, setMyGroups] = useState<GroupWithMemberCount[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<GroupWithMemberCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      const supabase = createClient()

      if (profile) {
        // Fetch groups the user is a member of
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select(`
            group_id,
            groups (
              id,
              name,
              description,
              icon,
              is_public,
              created_by,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', profile.id)

        if (memberGroups) {
          const groupsWithCount = await Promise.all(
            memberGroups.map(async (m) => {
              const group = m.groups as unknown as Group
              const { count } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id)
              return { ...group, member_count: count || 0 }
            })
          )
          setMyGroups(groupsWithCount)
        }
      }

      // Fetch public groups for discovery (exclude user's groups)
      const { data: publicGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (publicGroups) {
        const myGroupIds = myGroups.map(g => g.id)
        const filteredGroups = publicGroups.filter(g => !myGroupIds.includes(g.id))

        const groupsWithCount = await Promise.all(
          filteredGroups.map(async (group) => {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)
            return { ...group, member_count: count || 0 }
          })
        )
        setDiscoverGroups(groupsWithCount)
      }

      setLoading(false)
    }

    fetchGroups()
  }, [profile])

  const handleJoinGroup = async (groupId: string) => {
    if (!profile) return

    const supabase = createClient()
    await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
        role: 'member',
      })

    // Move group from discover to my groups
    const joinedGroup = discoverGroups.find(g => g.id === groupId)
    if (joinedGroup) {
      setMyGroups(prev => [...prev, joinedGroup])
      setDiscoverGroups(prev => prev.filter(g => g.id !== groupId))
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

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
      {profile && (
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">MY GROUPS</h2>
          {myGroups.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="font-medium text-gray-800 dark:text-white mb-1">No groups yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Join a group below or create your own to connect with other players
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/community/groups/${group.id}`}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-xl">
                      {group.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{group.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{group.member_count} members</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover Groups */}
      <div className="px-4 pt-2 pb-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">DISCOVER</h2>
        {discoverGroups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-medium text-gray-800 dark:text-white mb-1">No public groups yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Be the first to create a group for your tennis community!
            </p>
            <Link
              href="/community/groups/create"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
            >
              <Plus className="w-4 h-4" />
              Create a Group
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {discoverGroups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg mb-2">
                  {group.icon}
                </div>
                <div className="font-semibold text-gray-800 dark:text-white text-sm">{group.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{group.member_count} members</div>
                {profile ? (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-semibold py-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all"
                  >
                    Join
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold py-2 rounded-lg block text-center"
                  >
                    Login to Join
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
