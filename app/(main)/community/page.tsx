'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PlayersTab } from './players-tab'
import { GroupsTab } from './groups-tab'
import { FeedTab } from './feed-tab'

type Tab = 'players' | 'groups' | 'feed'

function CommunityTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'groups' || tab === 'feed') return tab
    return 'players'
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'groups' || tab === 'feed') setActiveTab(tab)
    else setActiveTab('players')
  }, [searchParams])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'players') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.replace(`/community${params.size ? `?${params}` : ''}`, { scroll: false })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'players', label: 'Players' },
    { key: 'groups', label: 'Groups' },
    { key: 'feed', label: 'Feed' },
  ]

  return (
    <>
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 flex border-b border-gray-100 dark:border-gray-700">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === key
                ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'groups' && <GroupsTab />}
      {activeTab === 'feed' && <FeedTab />}
    </>
  )
}

export default function CommunityPage() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Community</h1>
      </div>

      <Suspense fallback={
        <div className="bg-white dark:bg-gray-800 flex border-b border-gray-100 dark:border-gray-700">
          {['Players', 'Groups', 'Feed'].map((label) => (
            <div key={label} className="flex-1 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">
              {label}
            </div>
          ))}
        </div>
      }>
        <CommunityTabs />
      </Suspense>
    </div>
  )
}
