'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Trash2, Download, Share2, Loader2, LogIn, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import type { Profile } from '@/lib/database.types'
import { templates, type MatchWithSets } from './types'
import { ProTemplate } from './templates/ProTemplate'
import { PhotoProTemplate } from './templates/PhotoProTemplate'
import { SportyTemplate } from './templates/SportyTemplate'
import { DarkTemplate } from './templates/DarkTemplate'
import { NeonTemplate } from './templates/NeonTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'

function StoryCardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get('matchId')
  const isDemo = searchParams.get('demo') === 'true'
  const supabase = createClient()

  const [selectedTemplate, setSelectedTemplate] = useState('pro')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [match, setMatch] = useState<MatchWithSets | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ winRate: 0, streak: 0 })
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [nameDisplayMode, setNameDisplayMode] = useState<'username' | 'fullname'>('fullname')
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      // Demo mode - load from sessionStorage
      if (isDemo) {
        const demoData = sessionStorage.getItem('demoMatch')
        if (demoData) {
          const demoMatch = JSON.parse(demoData)
          setMatch(demoMatch as MatchWithSets)
          // Set demo stats
          setStats({ winRate: demoMatch.result === 'win' ? 100 : 0, streak: demoMatch.result === 'win' ? 1 : 0 })
        }
        setLoading(false)
        return
      }

      if (!matchId) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch match with sets and linked profiles
      const { data: matchData } = await supabase
        .from('matches')
        .select('*, match_sets(*)')
        .eq('id', matchId)
        .single()

      if (matchData) {
        const userIsOwner = matchData.user_id === user.id
        setIsOwner(userIsOwner)

        // Fetch linked profiles if any (include creator for shared matches)
        const profileIds = [
          matchData.opponent_user_id,
          matchData.partner_user_id,
          matchData.opponent_partner_user_id,
          !userIsOwner ? matchData.user_id : null, // Fetch creator profile for shared matches
        ].filter((id): id is string => id !== null && id !== undefined)

        let linkedProfiles: Profile[] = []
        if (profileIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', profileIds)

          linkedProfiles = profiles || []
        }

        const creatorProf = linkedProfiles.find(p => p.id === matchData.user_id) || null
        setCreatorProfile(creatorProf)

        if (userIsOwner) {
          // Owner view: show match as-is
          const matchWithProfiles: MatchWithSets = {
            ...matchData,
            opponent_profile: linkedProfiles.find(p => p.id === matchData.opponent_user_id) || null,
            partner_profile: linkedProfiles.find(p => p.id === matchData.partner_user_id) || null,
            opponent_partner_profile: linkedProfiles.find(p => p.id === matchData.opponent_partner_user_id) || null,
          }
          setMatch(matchWithProfiles)
        } else {
          // Shared view: flip perspective so current user sees themselves as player
          // Determine the role of current user
          const isOpponent = matchData.opponent_user_id === user.id
          const isPartner = matchData.partner_user_id === user.id
          const isOpponentPartner = matchData.opponent_partner_user_id === user.id
          const isOnOpponentSide = isOpponent || isOpponentPartner

          // Get all linked profiles
          const creatorPartnerProfile = linkedProfiles.find(p => p.id === matchData.partner_user_id) || null
          const opponentProfile = linkedProfiles.find(p => p.id === matchData.opponent_user_id) || null
          const opponentPartnerProfile = linkedProfiles.find(p => p.id === matchData.opponent_partner_user_id) || null

          if (isPartner) {
            // Partner view: same team as creator, keep perspective but show partner's view
            const matchWithProfiles: MatchWithSets = {
              ...matchData,
              opponent_profile: opponentProfile,
              partner_profile: creatorProf, // Creator is now their partner
              opponent_partner_profile: opponentPartnerProfile,
              // Swap partner_name to show creator as partner
              partner_name: creatorProf?.full_name || creatorProf?.username || 'Partner',
            }
            setMatch(matchWithProfiles)
          } else if (isOnOpponentSide) {
            // Opponent side view: flip entire perspective
            // Invert result
            let invertedResult = matchData.result
            if (matchData.result === 'win') invertedResult = 'loss'
            else if (matchData.result === 'loss') invertedResult = 'win'

            // Swap scores
            const transformedSets = matchData.match_sets.map(set => ({
              ...set,
              player_score: set.opponent_score,
              opponent_score: set.player_score,
            }))

            // For doubles: find viewer's teammate
            let teammateProfile: Profile | null = null
            let teammateName: string | null = null
            if (isOpponent) {
              // Viewer is opponent, their teammate is opponent_partner
              teammateProfile = opponentPartnerProfile
              teammateName = matchData.opponent_partner_name
            } else {
              // Viewer is opponent_partner, their teammate is opponent
              teammateProfile = opponentProfile
              teammateName = matchData.opponent_name
            }

            const matchWithProfiles: MatchWithSets = {
              ...matchData,
              match_sets: transformedSets,
              result: invertedResult,
              // Opponent side (creator's team) - now shown as "opponent" from viewer's perspective
              opponent_name: creatorProf?.full_name || creatorProf?.username || 'Opponent',
              opponent_profile: creatorProf,
              opponent_partner_name: creatorPartnerProfile?.full_name || creatorPartnerProfile?.username || matchData.partner_name || 'Partner',
              opponent_partner_profile: creatorPartnerProfile,
              // Player side (viewer's team) - viewer's teammate becomes their partner
              partner_name: teammateName,
              partner_profile: teammateProfile,
            }
            setMatch(matchWithProfiles)
          } else {
            // Fallback: show as-is
            const matchWithProfiles: MatchWithSets = {
              ...matchData,
              opponent_profile: opponentProfile,
              partner_profile: creatorPartnerProfile,
              opponent_partner_profile: opponentPartnerProfile,
            }
            setMatch(matchWithProfiles)
          }
        }
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
  }, [matchId, isDemo, supabase])

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

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
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
        trackEvent('upload_background', { template_id: selectedTemplate })
        // Switch to a template that supports images if current one doesn't
        const currentTemplate = templates.find(t => t.id === selectedTemplate)
        if (!currentTemplate?.supportsImage) {
          setSelectedTemplate('photo-pro')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackgroundImage = () => {
    setBackgroundImage(null)
    trackEvent('remove_background')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleShare = async () => {
    const { domToBlob } = await import('modern-screenshot')

    if (!cardRef.current) return

    try {
      // Temporarily remove border-radius for export
      const originalBorderRadius = cardRef.current.style.borderRadius
      cardRef.current.style.borderRadius = '0'

      const blob = await domToBlob(cardRef.current, {
        scale: 3,
        quality: 1,
        backgroundColor: '#1a6b9c',
        style: {
          borderRadius: '0',
        }
      })

      // Restore border-radius
      cardRef.current.style.borderRadius = originalBorderRadius

      if (!blob) return

      const file = new File([blob], 'matchpost-match.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Tennis Match',
            text: `I ${match?.result === 'win' ? 'won' : 'played'} ${formatScore()} against ${match?.opponent_name}! 🎾`,
          })
          trackEvent('share_story', {
            share_method: 'native',
            template_id: selectedTemplate,
            has_background: !!backgroundImage,
            match_type: match?.match_type || undefined,
            match_result: match?.result || undefined,
          })
        } catch (err) {
          console.log('Share cancelled or failed:', err)
        }
      } else {
        downloadImage(blob)
        trackEvent('share_story', {
          share_method: 'download',
          template_id: selectedTemplate,
          has_background: !!backgroundImage,
          match_type: match?.match_type || undefined,
          match_result: match?.result || undefined,
        })
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }

  const downloadImage = async (existingBlob?: Blob) => {
    let blob = existingBlob

    if (!blob) {
      const { domToBlob } = await import('modern-screenshot')
      if (!cardRef.current) return

      // Temporarily remove border-radius for export
      const originalBorderRadius = cardRef.current.style.borderRadius
      cardRef.current.style.borderRadius = '0'

      blob = await domToBlob(cardRef.current, {
        scale: 3,
        quality: 1,
        backgroundColor: '#1a6b9c',
        style: {
          borderRadius: '0',
        }
      })

      // Restore border-radius
      cardRef.current.style.borderRadius = originalBorderRadius
    }

    if (!blob) return

    const link = document.createElement('a')
    link.download = 'matchpost-match.png'
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)

    trackEvent('download_story', {
      template_id: selectedTemplate,
      has_background: !!backgroundImage,
      match_type: match?.match_type || undefined,
      match_result: match?.result || undefined,
    })
  }

  const handleDelete = async () => {
    if (!matchId) return

    setIsDeleting(true)
    try {
      // Delete match sets first (due to foreign key)
      await supabase
        .from('match_sets')
        .delete()
        .eq('match_id', matchId)

      // Delete the match
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (error) {
        console.error('Delete error:', error)
        setIsDeleting(false)
        return
      }

      trackEvent('delete_match', {
        match_type: match?.match_type || undefined,
        match_result: match?.result || undefined,
        source: 'story_card',
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Delete failed:', err)
      setIsDeleting(false)
    }
  }

  // Get sorted sets for scoreboard
  const sortedSets = match?.match_sets?.sort((a, b) => a.set_number - b.set_number) || []

  // Get display name based on user preference
  const displayName = isDemo
    ? 'You'
    : nameDisplayMode === 'username' && profile?.username
      ? `@${profile.username}`
      : profile?.full_name || profile?.username || 'You'

  const currentTemplate = templates.find(t => t.id === selectedTemplate)
  const hasCustomBg = backgroundImage && currentTemplate?.supportsImage

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-900 dark:text-white p-6">
        <div className="text-4xl mb-4">🎾</div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Match not found</p>
        <Link href="/dashboard" className="text-yellow-600 dark:text-yellow-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  // Template props
  const templateProps = {
    match,
    profile,
    stats,
    displayName,
    nameDisplayMode,
    backgroundImage,
    hasCustomBg: !!hasCustomBg,
    cardRef,
    formatScore,
    formatDate,
    formatShortDate,
    sortedSets,
  }

  // Render template based on selection
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'pro':
        return <ProTemplate ref={cardRef} {...templateProps} />
      case 'photo-pro':
        return <PhotoProTemplate ref={cardRef} {...templateProps} />
      case 'sporty':
        return <SportyTemplate ref={cardRef} {...templateProps} />
      case 'dark':
        return <DarkTemplate ref={cardRef} {...templateProps} />
      case 'neon':
        return <NeonTemplate ref={cardRef} {...templateProps} />
      case 'minimal':
        return <MinimalTemplate ref={cardRef} {...templateProps} />
      default:
        return <ProTemplate ref={cardRef} {...templateProps} />
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Match?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                This will permanently delete this match and all its data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center justify-between text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Create Story Card</h1>
        {isDemo ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        ) : isOwner ? (
          <div className="flex items-center gap-1">
            <Link
              href={`/record?matchId=${matchId}&edit=true`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
            >
              <Pencil className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-500 dark:text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="w-10" /> // Empty space for non-owners
        )}
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="mx-6 mt-4 mb-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3">
          <p className="text-yellow-700 dark:text-yellow-200 text-sm text-center">
            🎉 Demo Mode - Login to save your matches!
          </p>
        </div>
      )}

      {/* Preview */}
      <div className={`px-6 mb-6 ${!isDemo ? 'mt-4' : ''}`}>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-2 text-center">Preview</div>
        {renderTemplate()}
      </div>

      {/* Photo Upload */}
      <div className="px-6 mb-4">
        <div className="text-gray-700 dark:text-white text-sm mb-3">Background Photo</div>
        <div className="flex gap-3">
          <label className="flex-1 cursor-pointer">
            <div className="bg-gray-100 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-white/30 rounded-xl p-4 text-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
              <Camera className="w-6 h-6 mx-auto mb-1 text-gray-500 dark:text-white" />
              <div className="text-gray-700 dark:text-white text-sm">Upload Photo</div>
              <div className="text-gray-400 dark:text-white/50 text-xs">JPG, PNG</div>
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
          <div className="mt-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
            <span>✓</span>
            <span>Photo added! Select a template that supports custom backgrounds.</span>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="px-4 mb-6">
        <div className="text-gray-700 dark:text-white text-sm mb-3 px-2">Choose Template</div>
        <div className="flex gap-3 overflow-x-auto py-1 px-2 hide-scrollbar">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id)
                trackEvent('select_template', { template_id: template.id, template_name: template.name })
              }}
              className={`flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden flex flex-col justify-between p-2 transition-all relative ${
                selectedTemplate === template.id ? 'ring-2 ring-yellow-500 dark:ring-white ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' : ''
              } ${template.id === 'dark' ? 'border border-gray-300 dark:border-gray-700/50' : ''}`}
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}></div>

              {/* Custom bg indicator */}
              {template.supportsImage && backgroundImage && (
                <div className="absolute inset-0">
                  <img src={backgroundImage} alt="" className="w-full h-full object-cover opacity-50" />
                </div>
              )}

              {/* Mini preview based on template type */}
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                {(template.id === 'pro' || template.id === 'photo-pro') && (
                  <div className="flex flex-col gap-1">
                    <div className="bg-white/90 rounded h-2.5 w-full"></div>
                    <div className="bg-white/70 rounded h-2.5 w-full"></div>
                  </div>
                )}
                {template.id === 'sporty' && (
                  <div className="flex flex-col gap-1 items-center">
                    <div className="bg-white/30 rounded-full w-6 h-6"></div>
                    <div className="bg-white text-[8px] font-bold px-1.5 rounded">VS</div>
                    <div className="bg-black/30 rounded-full w-6 h-6"></div>
                  </div>
                )}
                {template.id === 'dark' && (
                  <div className="text-center">
                    <div className="text-yellow-400 text-[10px] font-bold">WIN</div>
                    <div className="text-white text-[8px]">6-4</div>
                  </div>
                )}
                {template.id === 'neon' && (
                  <div className="flex flex-col gap-1">
                    <div className="border border-cyan-400/50 rounded h-2.5 w-full"></div>
                    <div className="border border-pink-400/50 rounded h-2.5 w-full"></div>
                  </div>
                )}
                {template.id === 'minimal' && (
                  <div className="text-center">
                    <div className="text-gray-800 text-xs font-light">6-4</div>
                  </div>
                )}
              </div>

              <span className={`text-xs font-medium relative z-10 ${
                template.id === 'minimal' ? 'text-gray-700' : 'text-white'
              }`}>
                {template.name}
              </span>

              {/* Image support indicator */}
              {template.supportsImage && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-white/80 rounded-full flex items-center justify-center">
                  <Camera className="w-2 h-2 text-gray-600" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="text-gray-400 dark:text-white/40 text-xs mt-2 px-2">
          📷 = Supports custom background photo
        </div>
      </div>

      {/* Name Display Option */}
      {!isDemo && profile && (profile.username || profile.full_name) && (
        <div className="px-6 mb-6">
          <div className="text-gray-700 dark:text-white text-sm mb-3">Display Name</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setNameDisplayMode('fullname')
                trackEvent('toggle_name_display', { name_display_mode: 'fullname' })
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                nameDisplayMode === 'fullname'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              {profile.full_name || 'Full Name'}
            </button>
            <button
              onClick={() => {
                setNameDisplayMode('username')
                trackEvent('toggle_name_display', { name_display_mode: 'username' })
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                nameDisplayMode === 'username'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20'
              }`}
            >
              {profile.username ? `@${profile.username}` : 'Username'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 space-y-3 pb-4">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Share to Instagram Story
        </button>
        <button
          onClick={() => downloadImage()}
          className="w-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
        >
          <Download className="w-5 h-5" />
          Save to Gallery
        </button>
        <button
          onClick={() => {
            trackEvent('skip_story', { template_id: selectedTemplate })
            router.push('/dashboard?refresh=true')
          }}
          className="w-full text-gray-500 dark:text-gray-400 font-medium py-3 hover:text-gray-700 dark:hover:text-white transition-all"
        >
          Skip for now →
        </button>
      </div>
    </div>
  )
}

export default function StoryCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
      </div>
    }>
      <StoryCardContent />
    </Suspense>
  )
}
