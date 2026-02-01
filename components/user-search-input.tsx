'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Search, X, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/database.types'

// Dummy players for guest/demo mode
const DUMMY_PLAYERS: Profile[] = [
  {
    id: 'demo-1',
    username: 'johndoe',
    full_name: 'John Doe',
    avatar_url: null,
    bio: null,
    location: 'Jakarta',
    skill_level: 'intermediate',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'demo-2',
    username: 'janesmith',
    full_name: 'Jane Smith',
    avatar_url: null,
    bio: null,
    location: 'Bandung',
    skill_level: 'advanced',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'demo-3',
    username: 'alexwong',
    full_name: 'Alex Wong',
    avatar_url: null,
    bio: null,
    location: 'Surabaya',
    skill_level: 'beginner',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'demo-4',
    username: 'mariagarcia',
    full_name: 'Maria Garcia',
    avatar_url: null,
    bio: null,
    location: 'Bali',
    skill_level: 'pro',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'demo-5',
    username: 'davidlee',
    full_name: 'David Lee',
    avatar_url: null,
    bio: null,
    location: 'Yogyakarta',
    skill_level: 'intermediate',
    created_at: '',
    updated_at: '',
  },
]

interface UserSearchInputProps {
  label: string
  placeholder: string
  value: string
  selectedUser: Profile | null
  onChange: (value: string) => void
  onUserSelect: (user: Profile | null) => void
  isGuestMode?: boolean
  excludeUserId?: string | null  // Current user's ID to exclude from search results
  recentPlayers?: Profile[]  // Recent opponents/partners to show as suggestions
}

export default function UserSearchInput({
  label,
  placeholder,
  value,
  selectedUser,
  onChange,
  onUserSelect,
  isGuestMode = false,
  excludeUserId = null,
  recentPlayers = [],
}: UserSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Search for users when input changes
  useEffect(() => {
    const searchUsers = async () => {
      if (value.length < 2 || selectedUser) {
        setSearchResults([])
        // Show recent players if value is short and we have them
        if (value.length < 2 && recentPlayers.length > 0 && !selectedUser) {
          setShowRecent(true)
        }
        return
      }

      // Hide recent when searching
      setShowRecent(false)
      setIsSearching(true)

      // Guest mode: filter dummy players
      if (isGuestMode) {
        const filtered = DUMMY_PLAYERS.filter(
          p =>
            p.username?.toLowerCase().includes(value.toLowerCase()) ||
            p.full_name?.toLowerCase().includes(value.toLowerCase())
        )
        setSearchResults(filtered)
        setShowDropdown(true)
        setIsSearching(false)
        return
      }

      // Logged in: search real users
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${value}%,full_name.ilike.%${value}%`)
          .limit(5)

        // Exclude current user from results
        if (excludeUserId) {
          query = query.neq('id', excludeUserId)
        }

        const { data } = await query

        setSearchResults(data || [])
        setShowDropdown(true)
      } catch (err) {
        console.error('Search error:', err)
      }
      setIsSearching(false)
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [value, selectedUser, supabase, isGuestMode])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setShowRecent(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectUser = (user: Profile) => {
    onUserSelect(user)
    onChange(user.full_name || user.username || '')
    setShowDropdown(false)
    setShowRecent(false)
  }

  const handleClearUser = () => {
    onUserSelect(null)
    onChange('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    // If user was selected but input changed, clear the selection
    if (selectedUser && newValue !== (selectedUser.full_name || selectedUser.username)) {
      onUserSelect(null)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (selectedUser) return
            if (value.length >= 2) {
              setShowDropdown(true)
              setShowRecent(false)
            } else if (recentPlayers.length > 0) {
              setShowRecent(true)
              setShowDropdown(false)
            }
          }}
          className={`input pl-11 pr-10 ${selectedUser ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6">
          {selectedUser ? (
            selectedUser.avatar_url ? (
              <Image
                src={selectedUser.avatar_url}
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            )
          ) : isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        {selectedUser && (
          <button
            type="button"
            onClick={handleClearUser}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Search hint */}
      {!selectedUser && value.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {isGuestMode
            ? 'Type to search demo players (e.g. John, Jane, Alex)'
            : 'Type username to link to a registered player, or enter any name'}
        </p>
      )}

      {/* Selected user indicator */}
      {selectedUser && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
          <span>✓</span>{' '}
          {isGuestMode ? (
            'Demo player'
          ) : selectedUser.username ? (
            <>
              Linked to{' '}
              <a
                href={`/profile/${selectedUser.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium hover:underline"
              >
                @{selectedUser.username}
              </a>
            </>
          ) : (
            `Linked to ${selectedUser.full_name || 'player'}`
          )}
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && searchResults.length > 0 && !selectedUser && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {isGuestMode ? 'Demo players' : 'Registered players'}
          </div>
          {searchResults.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                </div>
              )}
              <div className="text-left min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {user.full_name || user.username}
                </div>
                {user.username && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}{user.location && ` • ${user.location}`}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && searchResults.length === 0 && value.length >= 2 && !isSearching && !selectedUser && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {isGuestMode
              ? 'No demo players found. Try "John", "Jane", or "Alex".'
              : 'No registered users found. The name will be saved as text.'}
          </p>
        </div>
      )}

      {/* Recent players dropdown */}
      {showRecent && recentPlayers.length > 0 && !selectedUser && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            Recent players
          </div>
          {recentPlayers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                </div>
              )}
              <div className="text-left min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {user.full_name || user.username}
                </div>
                {user.username && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}{user.location && ` • ${user.location}`}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
