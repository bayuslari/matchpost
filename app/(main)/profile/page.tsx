'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
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
  const supabase = useMemo(() => createClient(), [])
  const { profile, stats, isLoading, initialize, reset } = useUserStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    router.push('/')
  }

  const displayName = profile?.full_name || profile?.username || 'Player'
  const username = profile?.username ? `@${profile.username}` : ''
  const location = profile?.location || ''

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 px-6 pb-24 rounded-b-3xl header-safe-area">
          <div className="h-7 w-16 bg-yellow-600/30 rounded animate-pulse mb-6"></div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-32 bg-yellow-600/30 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-24 bg-yellow-600/30 rounded animate-pulse"></div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
        {/* Stats Card Skeleton */}
        <div className="px-6 -mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Menu Skeleton */}
        <div className="px-6 mt-6 space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 px-6 pb-24 rounded-b-3xl header-safe-area">
        <h1 className="text-xl font-bold mb-6">Profile</h1>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
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
            {username && <p className="text-yellow-800">{username}</p>}
            {location && <p className="text-yellow-800 text-sm mt-1">📍 {location}</p>}
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalMatches}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.wins}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.losses}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Losses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.winRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6 space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-medium ${item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.disabled && (
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${item.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'}`} />
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
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    {content}
                  </Link>
                )}
                {index < menuItems.length - 1 && <div className="border-t border-gray-100 dark:border-gray-700"></div>}
              </div>
            )
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {settingsItems.map((item, index) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-medium ${item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.disabled && (
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${item.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'}`} />
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
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    {content}
                  </Link>
                )}
                {index < settingsItems.length - 1 && <div className="border-t border-gray-100 dark:border-gray-700"></div>}
              </div>
            )
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold py-4 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 pb-4">
          MatchPost v1.0.0
        </p>
      </div>
    </div>
  )
}
