'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Match } from '@/lib/database.types'
import {
  BarChart3,
  Trophy,
  Camera,
  Link as LinkIcon,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-react'

const menuItems = [
  { icon: BarChart3, label: 'Detailed Statistics', href: '/stats' },
  { icon: Trophy, label: 'Achievements', href: '/achievements' },
  { icon: Camera, label: 'My Story Cards', href: '/story-cards' },
]

const settingsItems = [
  { icon: LinkIcon, label: 'Connected Accounts', href: '/settings/accounts' },
  { icon: Bell, label: 'Notifications', href: '/settings/notifications' },
  { icon: HelpCircle, label: 'Help & Support', href: '/support' },
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ matches: 0, wins: 0, losses: 0, winRate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch matches for stats
        const { data: matchesData } = await supabase
          .from('matches')
          .select('result')
          .eq('user_id', user.id)

        if (matchesData) {
          const total = matchesData.length
          const wins = matchesData.filter(m => m.result === 'win').length
          const losses = matchesData.filter(m => m.result === 'loss').length
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

          setStats({ matches: total, wins, losses, winRate })
        }
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayName = profile?.full_name || profile?.username || 'Player'
  const username = profile?.username ? `@${profile.username}` : ''
  const location = profile?.location || ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-24 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {username && <p className="text-green-100">{username}</p>}
            {location && <p className="text-green-100 text-sm mt-1">📍 {location}</p>}
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.matches}</div>
              <div className="text-xs text-gray-500">Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-xs text-gray-500">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
              <div className="text-xs text-gray-500">Losses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6 space-y-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              {index < menuItems.length - 1 && <div className="border-t border-gray-100"></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {settingsItems.map((item, index) => (
            <div key={item.label}>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              {index < settingsItems.length - 1 && <div className="border-t border-gray-100"></div>}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <p className="text-center text-xs text-gray-400 mt-4 pb-4">
          MatchPost v1.0.0
        </p>
      </div>
    </div>
  )
}
