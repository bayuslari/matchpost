'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

  // For demo purposes - skip login
  const handleDemoLogin = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Link 
        href="/"
        className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Link>
      
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🎾</div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome to MatchPost</h2>
        <p className="text-gray-500 mt-1">Sign in to track your matches</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Google Login */}
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Loading...' : 'Continue with Google'}
        </button>

        {/* Email Login - Can be expanded later */}
        <button 
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Demo Mode */}
        <button 
          onClick={handleDemoLogin}
          className="w-full text-gray-500 font-medium py-3 hover:text-gray-700 transition-all"
        >
          Try Demo Mode →
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
