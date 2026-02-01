import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profile-client'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, bio, avatar_url, location, skill_level')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'User Not Found | MatchPost',
      description: 'This user profile could not be found.',
    }
  }

  const displayName = profile.full_name || profile.username || 'Player'
  const description = profile.bio
    ? `${profile.bio.slice(0, 150)}${profile.bio.length > 150 ? '...' : ''}`
    : `Check out ${displayName}'s tennis stats and match history on MatchPost.`

  return {
    title: `${displayName} (@${profile.username}) | MatchPost`,
    description,
    openGraph: {
      title: `${displayName} - Tennis Player Profile`,
      description,
      type: 'profile',
      images: profile.avatar_url ? [{ url: profile.avatar_url, width: 200, height: 200, alt: displayName }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${profile.username})`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  return <ProfileClient username={username} />
}
