'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Loader2, Plus, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserSearchInput from '@/components/user-search-input'
import type { Profile } from '@/lib/database.types'

export default function RecordMatchPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isGuestMode, setIsGuestMode] = useState(false)
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsGuestMode(!user)
    }
    checkAuth()
  }, [supabase])

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
        router.push('/story-card?demo=true')
        return
      }

      // Insert match
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

      // Navigate to story card with match ID
      router.push(`/story-card?matchId=${matchData.id}`)

    } catch (err) {
      console.error('Error:', err)
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-black/10 rounded-full text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Record Match</h1>
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
          <div className="relative">
            <input
              type="text"
              placeholder="Where did you play?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input pl-10"
            />
            <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
          </div>
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
              Creating...
            </>
          ) : (
            'Create Story Card →'
          )}
        </button>
      </div>
    </div>
  )
}
