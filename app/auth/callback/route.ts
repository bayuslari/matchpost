import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

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
    // Return with detailed error
    return NextResponse.redirect(
      `${origin}/login?error=auth&error_description=${encodeURIComponent(error.message)}`
    )
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=auth&error_description=No+code+provided`)
}
