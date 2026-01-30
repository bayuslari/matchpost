'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Pencil
} from 'lucide-react'

const menuItems = [
  { icon: BarChart3, label: 'Detailed Statistics', href: '/stats', disabled: false },
  { icon: Trophy, label: 'Achievements', href: '/achievements', disabled: true },
  { icon: Camera, label: 'My Story Cards', href: '/story-cards', disabled: true },
]

const settingsItems = [
  { icon: LinkIcon, label: 'Connected Accounts', href: '/settings/accounts', disabled: true },
  { icon: Bell, label: 'Notifications', href: '/settings/notifications', disabled: true },
  { icon: HelpCircle, label: 'Help & Support', href: '/support', disabled: true },
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
          // Auto-generate username from email if not set
          if (!profileData.username && user.email) {
            const generatedUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .update({ username: generatedUsername })
              .eq('id', user.id)
              .select()
              .single()

            if (updatedProfile) {
              setProfile(updatedProfile)
            } else {
              setProfile(profileData)
            }
          } else {
            setProfile(profileData)
          }
        }

        // Fetch matches for stats
        const { data: matchesData } = await supabase
          .from('matches')
          .select('result')
          .eq('user_id', user.id)

        if (matchesData && matchesData.length > 0) {
          const total = matchesData.length
          const wins = matchesData.filter((m: { result: string | null }) => m.result === 'win').length
          const losses = matchesData.filter((m: { result: string | null }) => m.result === 'loss').length
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
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-24 rounded-b-3xl">
        <h1 className="text-xl font-bold mb-6">Profile</h1>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <svg className={`w-10 h-10 text-white/70 ${profile?.avatar_url ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {username && <p className="text-green-100">{username}</p>}
            {location && <p className="text-green-100 text-sm mt-1">📍 {location}</p>}
          </div>
          <Link
            href="/profile/edit"
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
          >
            <Pencil className="w-5 h-5" />
          </Link>
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
          {menuItems.map((item, index) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className={`font-medium ${item.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.disabled && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
              </>
            )

            return (
              <div key={item.label}>
                {item.disabled ? (
                  <div className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
                    {content}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                  >
                    {content}
                  </Link>
                )}
                {index < menuItems.length - 1 && <div className="border-t border-gray-100"></div>}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {settingsItems.map((item, index) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className={`font-medium ${item.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.disabled && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
              </>
            )

            return (
              <div key={item.label}>
                {item.disabled ? (
                  <div className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
                    {content}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                  >
                    {content}
                  </Link>
                )}
                {index < settingsItems.length - 1 && <div className="border-t border-gray-100"></div>}
              </div>
            )
          })}
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
