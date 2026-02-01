import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = ['/dashboard', '/profile', '/record', '/stats', '/community']

function getSafeRedirectPath(next: string | null): string {
  if (!next) return '/dashboard'
  // Only allow relative paths that start with / and are in whitelist
  if (next.startsWith('/') && !next.startsWith('//') && ALLOWED_REDIRECTS.some(path => next.startsWith(path))) {
    return next
  }
  return '/dashboard'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = getSafeRedirectPath(searchParams.get('next'))

  // If there's an error from OAuth provider
  if (error_param) {
    return NextResponse.redirect(
      `${origin}/login?error=${error_param}&error_description=${encodeURIComponent(error_description || '')}`
    )
  }

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // Return with generic error (don't expose internal error details to users)
    console.error('Auth error:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=auth&error_description=${encodeURIComponent('Authentication failed. Please try again.')}`
    )
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=auth&error_description=No+code+provided`)
}
