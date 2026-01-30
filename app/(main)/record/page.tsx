'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RecordMatchPage() {
  const router = useRouter()
  const supabase = createClient()
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles')
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ])
  const [opponent, setOpponent] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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

    const validSets = sets.filter(s => s.player !== '' && s.opponent !== '')
    if (validSets.length === 0) {
      setError('Please enter at least one set score')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Insert match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          match_type: matchType,
          opponent_name: opponent.trim(),
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
    <div className="min-h-dvh bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Record Match</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Match Type */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Match Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMatchType('singles')}
              className={`py-3 px-4 font-semibold rounded-xl transition-all ${
                matchType === 'singles'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Singles
            </button>
            <button
              onClick={() => setMatchType('doubles')}
              className={`py-3 px-4 font-semibold rounded-xl transition-all ${
                matchType === 'doubles'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Doubles
            </button>
          </div>
        </div>

        {/* Opponent */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Opponent Name</label>
          <input
            type="text"
            placeholder="Enter opponent name"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="input"
          />
        </div>

        {/* Score Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Score (per set)</label>
          <div className="space-y-3">
            {sets.map((set, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-12">Set {index + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={set.player}
                      onChange={(e) => handleSetChange(index, 'player', e.target.value)}
                      className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-center font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="7"
                    />
                    <span className="absolute -top-2 left-3 text-xs text-green-600 bg-green-50 px-1">You</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={set.opponent}
                      onChange={(e) => handleSetChange(index, 'opponent', e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      min="0"
                      max="7"
                    />
                    <span className="absolute -top-2 left-3 text-xs text-gray-500 bg-gray-50 px-1">Opp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
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
              Saving...
            </>
          ) : (
            'Save & Create Story Card →'
          )}
        </button>
      </div>
    </div>
  )
}
