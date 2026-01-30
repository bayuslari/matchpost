'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in:', error)
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error sending magic link:', error)
      setError('Failed to send login link. Please try again.')
      setIsLoading(false)
      return
    }

    setEmailSent(true)
    setIsLoading(false)
  }

  // For demo purposes - skip login
  const handleDemoLogin = () => {
    router.push('/dashboard')
  }

  // Email sent success screen
  if (emailSent) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-outfit text-3xl font-black mb-6 tracking-wider uppercase">
            <span className="text-gray-800 dark:text-white">MATCH</span>
            <span className="text-yellow-500">POST</span>
          </h1>
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Check your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            We sent a login link to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
          <button
            onClick={() => {
              setEmailSent(false)
              setEmail('')
            }}
            className="text-yellow-600 dark:text-yellow-400 font-medium hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <Link
        href="/"
        className="absolute top-4 left-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-outfit text-4xl font-black mb-3 tracking-wider uppercase">
          <span className="text-gray-800 dark:text-white">MATCH</span>
          <span className="text-yellow-500">POST</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Sign in to track your matches</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {showEmailForm ? (
          /* Email Form */
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
              className="input"
              autoFocus
            />
            <button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Login Link'
              )}
            </button>
            <button
              onClick={() => {
                setShowEmailForm(false)
                setError('')
              }}
              className="w-full text-gray-500 dark:text-gray-400 font-medium py-2 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
            >
              Back to login options
            </button>
          </div>
        ) : (
          /* Login Options */
          <>
            {/* Google Login - Recommended */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Loading...' : 'Continue with Google'}
            </button>

            {/* Email Login */}
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all border border-gray-200 dark:border-gray-700"
            >
              <Mail className="w-5 h-5" />
              Continue with Email
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-gray-400 dark:text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Demo Mode */}
            <button
              onClick={handleDemoLogin}
              className="w-full text-gray-500 dark:text-gray-400 font-medium py-3 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
            >
              Try Demo Mode →
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="text-yellow-600 dark:text-yellow-400 hover:underline whitespace-nowrap">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-yellow-600 dark:text-yellow-400 hover:underline whitespace-nowrap">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
