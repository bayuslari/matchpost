'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import UserSearchInput from '@/components/user-search-input'
import LocationInput from '@/components/location-input'
import type { Profile } from '@/lib/database.types'

function RecordMatchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Edit mode
  const matchId = searchParams.get('matchId')
  const isEditMode = searchParams.get('edit') === 'true' && !!matchId
  const [isLoadingMatch, setIsLoadingMatch] = useState(isEditMode)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles')
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ])
  const [visibleSets, setVisibleSets] = useState(3)
  const MAX_SETS = 5
  const [opponent, setOpponent] = useState('')
  const [opponentUser, setOpponentUser] = useState<Profile | null>(null)
  const [partner, setPartner] = useState('')
  const [partnerUser, setPartnerUser] = useState<Profile | null>(null)
  const [opponent2, setOpponent2] = useState('')
  const [opponent2User, setOpponent2User] = useState<Profile | null>(null)
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentPlayers, setRecentPlayers] = useState<Profile[]>([])

  // Check if user is logged in and load match data if editing
  useEffect(() => {
    async function initPage() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsGuestMode(!user)
      setCurrentUserId(user?.id || null)

      // Fetch recent players from match history
      if (user) {
        const { data: recentMatches } = await supabase
          .from('matches')
          .select('opponent_user_id, partner_user_id, opponent_partner_user_id')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(10)

        if (recentMatches) {
          // Collect unique user IDs (excluding nulls)
          const userIds = new Set<string>()
          recentMatches.forEach(match => {
            if (match.opponent_user_id) userIds.add(match.opponent_user_id)
            if (match.partner_user_id) userIds.add(match.partner_user_id)
            if (match.opponent_partner_user_id) userIds.add(match.opponent_partner_user_id)
          })

          if (userIds.size > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .in('id', Array.from(userIds))
              .limit(5)

            if (profiles) {
              setRecentPlayers(profiles)
            }
          }
        }
      }

      // Load existing match data for edit mode
      if (isEditMode && matchId && user) {
        const { data: matchData } = await supabase
          .from('matches')
          .select('*, match_sets(*)')
          .eq('id', matchId)
          .single()

        if (matchData) {
          // Check if user is the owner
          if (matchData.user_id !== user.id) {
            router.push('/dashboard')
            return
          }

          // Pre-fill form with existing data
          setMatchType(matchData.match_type)
          setOpponent(matchData.opponent_name)
          setLocation(matchData.location || '')
          setDate(matchData.played_at.split('T')[0])

          if (matchData.match_type === 'doubles') {
            setPartner(matchData.partner_name || '')
            setOpponent2(matchData.opponent_partner_name || '')
          }

          // Load linked user profiles if any
          const profileIds = [
            matchData.opponent_user_id,
            matchData.partner_user_id,
            matchData.opponent_partner_user_id,
          ].filter((id): id is string => id !== null)

          if (profileIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .in('id', profileIds)

            if (profiles) {
              const opponentProfile = profiles.find(p => p.id === matchData.opponent_user_id)
              const partnerProfile = profiles.find(p => p.id === matchData.partner_user_id)
              const opponent2Profile = profiles.find(p => p.id === matchData.opponent_partner_user_id)

              if (opponentProfile) setOpponentUser(opponentProfile)
              if (partnerProfile) setPartnerUser(partnerProfile)
              if (opponent2Profile) setOpponent2User(opponent2Profile)
            }
          }

          // Load sets
          if (matchData.match_sets && matchData.match_sets.length > 0) {
            const sortedSets = [...matchData.match_sets].sort((a, b) => a.set_number - b.set_number)
            const newSets = [
              { player: '', opponent: '' },
              { player: '', opponent: '' },
              { player: '', opponent: '' },
              { player: '', opponent: '' },
              { player: '', opponent: '' },
            ]
            sortedSets.forEach((set, index) => {
              if (index < 5) {
                newSets[index] = {
                  player: set.player_score.toString(),
                  opponent: set.opponent_score.toString(),
                }
              }
            })
            setSets(newSets)
            setVisibleSets(Math.max(sortedSets.length, 1))
          }
        }
        setIsLoadingMatch(false)
      }
    }
    initPage()
  }, [supabase, isEditMode, matchId, router])

  const handleSetChange = (index: number, field: 'player' | 'opponent', value: string) => {
    const newSets = [...sets]
    newSets[index][field] = value
    setSets(newSets)
  }

  const handleSubmit = async () => {
    // Validation
    if (!opponent.trim()) {
      setError('Please enter opponent name')
      return
    }

    if (matchType === 'doubles' && !partner.trim()) {
      setError('Please enter your partner name')
      return
    }

    const validSets = sets.slice(0, visibleSets).filter(s => s.player !== '' && s.opponent !== '')
    if (validSets.length === 0) {
      setError('Please enter at least one set score')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Calculate result based on sets won
      const playerSetsWon = validSets.filter(s => parseInt(s.player) > parseInt(s.opponent)).length
      const opponentSetsWon = validSets.filter(s => parseInt(s.opponent) > parseInt(s.player)).length
      const result = playerSetsWon > opponentSetsWon ? 'win' : playerSetsWon < opponentSetsWon ? 'loss' : 'draw'

      // Demo mode - save to sessionStorage instead of database
      if (!user) {
        const demoMatch = {
          id: 'demo',
          match_type: matchType,
          opponent_name: opponent.trim(),
          opponent_user_id: opponentUser?.id || null,
          opponent_profile: opponentUser,
          partner_name: matchType === 'doubles' ? partner.trim() || null : null,
          partner_user_id: matchType === 'doubles' ? partnerUser?.id || null : null,
          partner_profile: matchType === 'doubles' ? partnerUser : null,
          opponent_partner_name: matchType === 'doubles' ? opponent2.trim() || null : null,
          opponent_partner_user_id: matchType === 'doubles' ? opponent2User?.id || null : null,
          opponent_partner_profile: matchType === 'doubles' ? opponent2User : null,
          location: location.trim() || null,
          played_at: date,
          result,
          match_sets: validSets.map((set, index) => ({
            set_number: index + 1,
            player_score: parseInt(set.player),
            opponent_score: parseInt(set.opponent),
          })),
        }

        sessionStorage.setItem('demoMatch', JSON.stringify(demoMatch))
        trackEvent('record_match_complete', {
          match_type: matchType,
          match_result: result,
          sets_count: validSets.length,
          is_guest: true,
        })
        router.push('/story-card?demo=true')
        return
      }

      // Calculate result for tracking
      const playerSetsWonForTracking = validSets.filter(s => parseInt(s.player) > parseInt(s.opponent)).length
      const opponentSetsWonForTracking = validSets.filter(s => parseInt(s.opponent) > parseInt(s.player)).length
      const resultForTracking = playerSetsWonForTracking > opponentSetsWonForTracking ? 'win' : playerSetsWonForTracking < opponentSetsWonForTracking ? 'loss' : 'draw'

      if (isEditMode && matchId) {
        // Update existing match
        const { error: matchError } = await supabase
          .from('matches')
          .update({
            match_type: matchType,
            opponent_name: opponent.trim(),
            opponent_user_id: opponentUser?.id || null,
            partner_name: matchType === 'doubles' ? partner.trim() || null : null,
            partner_user_id: matchType === 'doubles' ? partnerUser?.id || null : null,
            opponent_partner_name: matchType === 'doubles' ? opponent2.trim() || null : null,
            opponent_partner_user_id: matchType === 'doubles' ? opponent2User?.id || null : null,
            location: location.trim() || null,
            played_at: date,
            result: resultForTracking,
          })
          .eq('id', matchId)

        if (matchError) {
          console.error('Match update error:', matchError)
          setError('Failed to update match. Please try again.')
          setIsSubmitting(false)
          return
        }

        // Delete existing sets and insert new ones
        await supabase
          .from('match_sets')
          .delete()
          .eq('match_id', matchId)

        const setsToInsert = validSets.map((set, index) => ({
          match_id: matchId,
          set_number: index + 1,
          player_score: parseInt(set.player),
          opponent_score: parseInt(set.opponent),
        }))

        const { error: setsError } = await supabase
          .from('match_sets')
          .insert(setsToInsert)

        if (setsError) {
          console.error('Sets update error:', setsError)
        }

        trackEvent('edit_match', {
          match_type: matchType,
          match_result: resultForTracking,
          sets_count: validSets.length,
        })

        // Navigate back to story card
        router.push(`/story-card?matchId=${matchId}`)
      } else {
        // Insert new match
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_id: user.id,
            match_type: matchType,
            opponent_name: opponent.trim(),
            opponent_user_id: opponentUser?.id || null,
            partner_name: matchType === 'doubles' ? partner.trim() || null : null,
            partner_user_id: matchType === 'doubles' ? partnerUser?.id || null : null,
            opponent_partner_name: matchType === 'doubles' ? opponent2.trim() || null : null,
            opponent_partner_user_id: matchType === 'doubles' ? opponent2User?.id || null : null,
            location: location.trim() || null,
            played_at: date,
          })
          .select()
          .single()

        if (matchError) {
          console.error('Match error:', matchError)
          setError('Failed to save match. Please try again.')
          setIsSubmitting(false)
          return
        }

        // Insert sets
        const setsToInsert = validSets.map((set, index) => ({
          match_id: matchData.id,
          set_number: index + 1,
          player_score: parseInt(set.player),
          opponent_score: parseInt(set.opponent),
        }))

        const { error: setsError } = await supabase
          .from('match_sets')
          .insert(setsToInsert)

        if (setsError) {
          console.error('Sets error:', setsError)
          // Match was created but sets failed - still navigate
        }

        trackEvent('record_match_complete', {
          match_type: matchType,
          match_result: resultForTracking,
          sets_count: validSets.length,
          is_guest: false,
        })

        // Navigate to story card with match ID
        router.push(`/story-card?matchId=${matchData.id}`)
      }

    } catch (err) {
      console.error('Error:', err)
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Loading state for edit mode
  if (isLoadingMatch) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-yellow-500 px-4 pb-4 flex items-center gap-4 header-safe-area">
        <Link
          href={isEditMode ? `/story-card?matchId=${matchId}` : "/dashboard"}
          className="p-2 hover:bg-black/10 rounded-full text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Match' : 'Record Match'}</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Match Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Match Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMatchType('singles')}
              className={`py-3 px-4 font-semibold rounded-xl transition-all ${
                matchType === 'singles'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Singles
            </button>
            <button
              onClick={() => setMatchType('doubles')}
              className={`py-3 px-4 font-semibold rounded-xl transition-all ${
                matchType === 'doubles'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Doubles
            </button>
          </div>
        </div>

        {/* Partner (Doubles only) */}
        {matchType === 'doubles' && (
          <UserSearchInput
            label="Your Partner"
            placeholder={isGuestMode ? "Search demo players (e.g. John)" : "Search username or enter name"}
            value={partner}
            selectedUser={partnerUser}
            onChange={setPartner}
            onUserSelect={setPartnerUser}
            isGuestMode={isGuestMode}
            excludeUserId={currentUserId}
            recentPlayers={recentPlayers}
          />
        )}

        {/* Opponent */}
        <UserSearchInput
          label={matchType === 'doubles' ? 'Opponent 1' : 'Opponent Name'}
          placeholder={isGuestMode ? "Search demo players (e.g. John)" : "Search username or enter name"}
          value={opponent}
          selectedUser={opponentUser}
          onChange={setOpponent}
          onUserSelect={setOpponentUser}
          isGuestMode={isGuestMode}
          excludeUserId={currentUserId}
          recentPlayers={recentPlayers}
        />

        {/* Opponent 2 (Doubles only) */}
        {matchType === 'doubles' && (
          <UserSearchInput
            label="Opponent 2"
            placeholder={isGuestMode ? "Search demo players (e.g. Jane)" : "Search username or enter name"}
            value={opponent2}
            selectedUser={opponent2User}
            onChange={setOpponent2}
            onUserSelect={setOpponent2User}
            isGuestMode={isGuestMode}
            excludeUserId={currentUserId}
            recentPlayers={recentPlayers}
          />
        )}

        {/* Score Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Score (per set)</label>
            <span className="text-xs text-gray-400 dark:text-gray-500">Max 5 sets</span>
          </div>
          <div className="space-y-3">
            {sets.slice(0, visibleSets).map((set, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12">Set {index + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={set.player}
                      onChange={(e) => handleSetChange(index, 'player', e.target.value)}
                      className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center font-bold text-yellow-700 dark:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                      max="7"
                    />
                    <span className="absolute -top-2 left-3 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-gray-900 px-1">You</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={set.opponent}
                      onChange={(e) => handleSetChange(index, 'opponent', e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                      min="0"
                      max="7"
                    />
                    <span className="absolute -top-2 left-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-1">Opp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Remove Set Buttons */}
          <div className="flex gap-2 mt-3">
            {visibleSets < MAX_SETS && (
              <button
                type="button"
                onClick={() => setVisibleSets(prev => Math.min(prev + 1, MAX_SETS))}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Set {visibleSets + 1}
              </button>
            )}
            {visibleSets > 1 && (
              <button
                type="button"
                onClick={() => {
                  // Clear the last visible set data when removing
                  const newSets = [...sets]
                  newSets[visibleSets - 1] = { player: '', opponent: '' }
                  setSets(newSets)
                  setVisibleSets(prev => Math.max(prev - 1, 1))
                }}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-sm font-medium"
              >
                <Minus className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Location</label>
          <LocationInput
            value={location}
            onChange={setLocation}
            placeholder="Where did you play?"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Match →' : 'Create Story Card →'
          )}
        </button>
      </div>
    </div>
  )
}

export default function RecordMatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
      </div>
    }>
      <RecordMatchContent />
    </Suspense>
  )
}
