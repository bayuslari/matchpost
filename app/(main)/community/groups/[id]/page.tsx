'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Plus, Users, LogOut, Loader2, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { Group, Profile, Match, MatchSet } from '@/lib/database.types'

type GroupMemberWithProfile = {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  profiles: Profile
}

type MatchWithDetails = Match & {
  match_sets: MatchSet[]
  creator: Profile | null
  opponent: Profile | null
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useUserStore()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
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

      // Fetch matches in this group
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          match_sets(*),
          creator:profiles!matches_user_id_fkey(*),
          opponent:profiles!matches_opponent_user_id_fkey(*)
        `)
        .eq('group_id', groupId)
        .order('played_at', { ascending: false })

      if (matchesData) {
        setMatches(matchesData as unknown as MatchWithDetails[])
      }

      setLoading(false)
    }

    fetchGroup()
  }, [groupId, profile])

  const handleJoin = async () => {
    if (!profile || actionLoading) return

    setActionLoading(true)
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
      setActionLoading(false)
      return
    }

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
      const userMembership = membersData.find(m => m.user_id === profile.id)
      setIsMember(!!userMembership)
    }
    setActionLoading(false)
  }

  const handleLeave = async () => {
    if (!profile || isAdmin || actionLoading) return

    setActionLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', profile.id)

    if (error) {
      console.error('Failed to leave group:', error)
      setActionLoading(false)
      return
    }

    setIsMember(false)
    setActionLoading(false)
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
            <Link
              href={`/community/groups/${groupId}/settings`}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
            >
              <Settings className="w-5 h-5" />
            </Link>
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
              <div className="space-y-3">
                {matches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No matches recorded in this group yet</p>
                  </div>
                ) : (
                  matches.map((match) => {
                    const sets = match.match_sets?.sort((a, b) => a.set_number - b.set_number) || []
                    const isWin = match.result === 'win'
                    const isLoss = match.result === 'loss'

                    return (
                      <div
                        key={match.id}
                        className={`p-4 rounded-xl border-l-4 ${
                          isWin
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : isLoss
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              isWin
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                : isLoss
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                              {match.result?.toUpperCase() || 'DRAW'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {match.match_type === 'doubles' ? 'Doubles' : 'Singles'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(match.played_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {match.creator?.full_name || match.creator?.username || 'Unknown'}
                            {match.partner_name && ` & ${match.partner_name}`}
                          </span>
                          <span className="text-gray-400">vs</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {match.opponent?.full_name || match.opponent_name}
                            {match.opponent_partner_name && ` & ${match.opponent_partner_name}`}
                          </span>
                        </div>

                        {sets.length > 0 && (
                          <div className="flex gap-2">
                            {sets.map((set) => (
                              <span
                                key={set.id}
                                className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded"
                              >
                                {set.player_score}-{set.opponent_score}
                                {set.tiebreak_player !== null && (
                                  <sup className="text-xs text-gray-500">
                                    ({set.tiebreak_player}-{set.tiebreak_opponent})
                                  </sup>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
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
                disabled={actionLoading}
                className="w-full py-3 text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {actionLoading ? 'Leaving...' : 'Leave Group'}
              </button>
            )}
          </>
        ) : profile ? (
          <button
            onClick={handleJoin}
            disabled={actionLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Users className="w-5 h-5" />
            )}
            {actionLoading ? 'Joining...' : 'Join This Group'}
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
