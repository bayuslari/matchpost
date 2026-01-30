'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Trash2, Download, Share2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Match, MatchSet } from '@/lib/database.types'

const templates = [
  { id: 'sporty', name: 'Sporty', gradient: 'from-green-600 via-green-500 to-yellow-400' },
  { id: 'dark', name: 'Dark', gradient: 'from-gray-900 via-gray-800 to-gray-900' },
  { id: 'neon', name: 'Neon', gradient: 'from-purple-600 via-pink-500 to-orange-400' },
  { id: 'minimal', name: 'Minimal', gradient: 'from-white to-gray-100' },
]

type MatchWithSets = Match & { match_sets: MatchSet[] }

function StoryCardContent() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId')
  const supabase = createClient()

  const [selectedTemplate, setSelectedTemplate] = useState('sporty')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [match, setMatch] = useState<MatchWithSets | null>(null)
  const [stats, setStats] = useState({ winRate: 0, streak: 0 })
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      if (!matchId) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch match with sets
      const { data: matchData } = await supabase
        .from('matches')
        .select('*, match_sets(*)')
        .eq('id', matchId)
        .single()

      if (matchData) {
        setMatch(matchData as MatchWithSets)
      }

      // Fetch all matches for stats
      const { data: allMatches } = await supabase
        .from('matches')
        .select('result, played_at')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      if (allMatches) {
        const total = allMatches.length
        const wins = allMatches.filter(m => m.result === 'win').length
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

        // Calculate streak
        let streak = 0
        for (const m of allMatches) {
          if (m.result === 'win') {
            streak++
          } else {
            break
          }
        }

        setStats({ winRate, streak })
      }

      setLoading(false)
    }

    loadData()
  }, [matchId, supabase])

  // Format score from sets
  const formatScore = () => {
    if (!match?.match_sets || match.match_sets.length === 0) return '-'
    return match.match_sets
      .sort((a, b) => a.set_number - b.set_number)
      .map(s => `${s.player_score}-${s.opponent_score}`)
      .join(', ')
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string)
        setSelectedTemplate('custom')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackgroundImage = () => {
    setBackgroundImage(null)
    setSelectedTemplate('sporty')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleShare = async () => {
    const html2canvas = (await import('html2canvas')).default

    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], 'matchpost-match.png', { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My Tennis Match',
              text: `I ${match?.result === 'win' ? 'won' : 'played'} ${formatScore()} against ${match?.opponent_name}! 🎾`,
            })
          } catch (err) {
            console.log('Share cancelled or failed:', err)
          }
        } else {
          downloadImage(canvas)
        }
      }, 'image/png')
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }

  const downloadImage = async (existingCanvas?: HTMLCanvasElement) => {
    let canvas = existingCanvas

    if (!canvas) {
      const html2canvas = (await import('html2canvas')).default
      if (!cardRef.current) return
      canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
    }

    const link = document.createElement('a')
    link.download = 'matchpost-match.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const isMinimal = selectedTemplate === 'minimal'
  const hasCustomBg = selectedTemplate === 'custom' && backgroundImage

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-dvh bg-gray-900 flex flex-col items-center justify-center text-white p-6">
        <div className="text-4xl mb-4">🎾</div>
        <p className="text-gray-400 mb-4">Match not found</p>
        <Link href="/dashboard" className="text-green-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Create Story Card</h1>
        <div className="w-10"></div>
      </div>

      {/* Preview */}
      <div className="px-6 mb-6">
        <div className="text-gray-400 text-sm mb-2 text-center">Preview</div>

        {/* Instagram Story Preview */}
        <div
          ref={cardRef}
          className={`mx-auto w-64 h-[450px] rounded-3xl overflow-hidden shadow-2xl relative ${
            hasCustomBg ? '' : `bg-gradient-to-br ${templates.find(t => t.id === selectedTemplate)?.gradient || templates[0].gradient}`
          }`}
          style={hasCustomBg ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {/* Overlay for custom background */}
          {hasCustomBg && (
            <div className="absolute inset-0 bg-black/40"></div>
          )}

          <div className="h-full flex flex-col items-center justify-center p-6 text-center relative z-10">
            {/* Logo */}
            <div className="text-4xl mb-2">🎾</div>

            {/* Result Badge */}
            <div className={`px-4 py-1 rounded-full text-sm font-bold mb-4 ${
              isMinimal ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
            }`}>
              {match.result === 'win' ? 'VICTORY 🏆' : match.result === 'loss' ? 'DEFEAT' : 'DRAW'}
            </div>

            {/* Score */}
            <div
              className={`text-5xl font-black mb-2 ${isMinimal ? 'text-gray-800' : 'text-white'}`}
              style={{ textShadow: hasCustomBg ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}
            >
              {formatScore()}
            </div>

            {/* Opponent */}
            <div className={`text-lg mb-6 ${isMinimal ? 'text-gray-600' : 'text-white/80'}`}>
              vs {match.opponent_name}
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 gap-4 w-full mb-6 ${isMinimal ? 'text-gray-700' : 'text-white'}`}>
              <div className={`p-3 rounded-xl ${isMinimal ? 'bg-gray-100' : 'bg-white/10 backdrop-blur'}`}>
                <div className="text-2xl font-bold">{stats.winRate}%</div>
                <div className="text-xs opacity-70">Win Rate</div>
              </div>
              <div className={`p-3 rounded-xl ${isMinimal ? 'bg-gray-100' : 'bg-white/10 backdrop-blur'}`}>
                <div className="text-2xl font-bold">{stats.streak > 0 ? `🔥 ${stats.streak}` : '0'}</div>
                <div className="text-xs opacity-70">Streak</div>
              </div>
            </div>

            {/* Location & Date */}
            <div className={`text-xs ${isMinimal ? 'text-gray-500' : 'text-white/60'}`}>
              {match.location && (
                <>📍 {match.location}<br /></>
              )}
              {formatDate(match.played_at)}
            </div>

            {/* Watermark */}
            <div className={`mt-4 text-xs font-medium ${isMinimal ? 'text-gray-400' : 'text-white/40'}`}>
              MatchPost
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="px-6 mb-4">
        <div className="text-white text-sm mb-3">Background Photo</div>
        <div className="flex gap-3">
          <label className="flex-1 cursor-pointer">
            <div className="bg-white/10 border-2 border-dashed border-white/30 rounded-xl p-4 text-center hover:bg-white/20 transition-all">
              <Camera className="w-6 h-6 mx-auto mb-1 text-white" />
              <div className="text-white text-sm">Upload Photo</div>
              <div className="text-white/50 text-xs">JPG, PNG</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {backgroundImage && (
            <button
              onClick={removeBackgroundImage}
              className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 flex flex-col items-center justify-center hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <div className="text-red-400 text-xs mt-1">Remove</div>
            </button>
          )}
        </div>

        {backgroundImage && (
          <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
            <span>✓</span>
            <span>Photo added!</span>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="px-6 mb-6">
        <div className="text-white text-sm mb-3">Choose Template</div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id)
                if (template.id !== 'custom') setBackgroundImage(null)
              }}
              className={`flex-shrink-0 w-20 h-28 rounded-xl bg-gradient-to-br ${template.gradient} flex items-end p-2 transition-all ${
                selectedTemplate === template.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
              }`}
            >
              <span className={`text-xs font-medium ${template.id === 'minimal' ? 'text-gray-700' : 'text-white'}`}>
                {template.name}
              </span>
            </button>
          ))}

          {/* Custom template with uploaded photo */}
          {backgroundImage && (
            <button
              onClick={() => setSelectedTemplate('custom')}
              className={`flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden flex items-end p-2 relative transition-all ${
                selectedTemplate === 'custom' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
              }`}
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
              <span className="text-xs font-medium text-white relative z-10">Custom</span>
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 space-y-3">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Share to Instagram Story
        </button>
        <button
          onClick={() => downloadImage()}
          className="w-full bg-white/10 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
        >
          <Download className="w-5 h-5" />
          Save to Gallery
        </button>
      </div>
    </div>
  )
}

export default function StoryCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <StoryCardContent />
    </Suspense>
  )
}
