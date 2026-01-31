'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home, event: 'nav_home' as const, disabled: false },
  { href: '/groups', label: 'Groups', icon: Users, event: 'nav_groups' as const, disabled: true },
  { href: '/stats', label: 'Stats', icon: BarChart3, event: 'nav_stats' as const, disabled: false },
  { href: '/profile', label: 'Profile', icon: User, event: 'nav_profile' as const, disabled: false },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-around max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        if (item.disabled) {
          return (
            <div
              key={item.href}
              className="flex flex-col items-center text-gray-300 dark:text-gray-700 cursor-not-allowed"
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => trackEvent(item.event)}
            className={cn(
              'flex flex-col items-center transition-colors',
              isActive ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
