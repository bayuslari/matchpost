'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, Globe, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { Group } from '@/lib/database.types'

type GroupWithMemberCount = Group & { member_count: number }

// Helper to get member counts for multiple groups in one query
async function getMemberCounts(supabase: ReturnType<typeof createClient>, groupIds: string[]) {
  if (groupIds.length === 0) return new Map<string, number>()

  const { data } = await supabase
    .from('group_members')
    .select('group_id')
    .in('group_id', groupIds)

  const counts = new Map<string, number>()
  groupIds.forEach(id => counts.set(id, 0))

  if (data) {
    data.forEach(row => {
      counts.set(row.group_id, (counts.get(row.group_id) || 0) + 1)
    })
  }

  return counts
}

const PAGE_SIZE = 10

export function GroupsTab() {
  const { profile } = useUserStore()
  const [myGroups, setMyGroups] = useState<GroupWithMemberCount[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<GroupWithMemberCount[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null)
  const [myGroupIds, setMyGroupIds] = useState<string[]>([])

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      const supabase = createClient()

      let userGroupIds: string[] = []
      let myGroupsList: Group[] = []

      if (profile) {
        // Fetch groups the user is a member of
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select(`
            group_id,
            groups (*)
          `)
          .eq('user_id', profile.id)

        if (memberGroups) {
          myGroupsList = memberGroups
            .map(m => m.groups as unknown as Group)
            .filter(Boolean)
          userGroupIds = myGroupsList.map(g => g.id)
        }
      }

      setMyGroupIds(userGroupIds)

      // Fetch public groups for discovery (exclude user's groups)
      const { data: publicGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE + 1) // Fetch one extra to check if there are more

      let filteredPublicGroups = publicGroups
        ? publicGroups.filter(g => !userGroupIds.includes(g.id))
        : []

      // Check if there are more groups
      const hasMoreGroups = filteredPublicGroups.length > PAGE_SIZE
      if (hasMoreGroups) {
        filteredPublicGroups = filteredPublicGroups.slice(0, PAGE_SIZE)
      }
      setHasMore(hasMoreGroups)

      // Get all member counts in ONE query (fix N+1)
      const allGroupIds = [...userGroupIds, ...filteredPublicGroups.map(g => g.id)]
      const memberCounts = await getMemberCounts(supabase, allGroupIds)

      // Map counts to groups
      const myGroupsWithCount = myGroupsList.map(g => ({
        ...g,
        member_count: memberCounts.get(g.id) || 0
      }))

      const discoverGroupsWithCount = filteredPublicGroups.map(g => ({
        ...g,
        member_count: memberCounts.get(g.id) || 0
      }))

      setMyGroups(myGroupsWithCount)
      setDiscoverGroups(discoverGroupsWithCount)
      setLoading(false)
    }

    fetchGroups()
  }, [profile])

  const handleJoinGroup = async (groupId: string) => {
    if (!profile || joiningGroupId) return

    setJoiningGroupId(groupId)
    const supabase = createClient()

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
        role: 'member',
      })

    if (error) {
      console.error('Failed to join group:', error)
      setJoiningGroupId(null)
      return
    }

    // Move group from discover to my groups
    const joinedGroup = discoverGroups.find(g => g.id === groupId)
    if (joinedGroup) {
      setMyGroups(prev => [...prev, { ...joinedGroup, member_count: joinedGroup.member_count + 1 }])
      setDiscoverGroups(prev => prev.filter(g => g.id !== groupId))
      setMyGroupIds(prev => [...prev, groupId])
    }
    setJoiningGroupId(null)
  }

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const supabase = createClient()

    // Fetch next page of public groups
    const { data: publicGroups } = await supabase
      .from('groups')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(discoverGroups.length, discoverGroups.length + PAGE_SIZE)

    let newGroups = publicGroups
      ? publicGroups.filter(g => !myGroupIds.includes(g.id))
      : []

    // Check if there are more groups
    const hasMoreGroups = newGroups.length === PAGE_SIZE + 1
    if (hasMoreGroups) {
      newGroups = newGroups.slice(0, PAGE_SIZE)
    }
    setHasMore(hasMoreGroups || newGroups.length === PAGE_SIZE)

    if (newGroups.length > 0) {
      // Get member counts for new groups
      const memberCounts = await getMemberCounts(supabase, newGroups.map(g => g.id))

      const newGroupsWithCount = newGroups.map(g => ({
        ...g,
        member_count: memberCounts.get(g.id) || 0
      }))

      setDiscoverGroups(prev => [...prev, ...newGroupsWithCount])
    } else {
      setHasMore(false)
    }

    setLoadingMore(false)
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
            <p className="font-medium text-gray-800 dark:text-white mb-1">
              {myGroups.length > 0 ? 'No more groups to discover' : 'No public groups yet'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {myGroups.length > 0
                ? 'You\'ve joined all available groups! Create a new one to grow your community.'
                : 'Be the first to create a group for your tennis community!'}
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
          <>
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
                      disabled={joiningGroupId === group.id}
                      className="w-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-semibold py-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {joiningGroupId === group.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join'
                      )}
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

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Groups'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
