'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Logo */}
        <h1 className="font-outfit text-3xl font-black mb-8 tracking-wider uppercase">
          <span className="text-gray-800 dark:text-white">MATCH</span>
          <span className="text-yellow-500">POST</span>
        </h1>

        {/* Error Icon */}
        <div className="text-6xl mb-6">
          😵
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Something went wrong!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
          An unexpected error occurred. Don&apos;t worry, it&apos;s not your fault.
        </p>

        {/* Error Message */}
        {error.message && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-8 max-w-sm mx-auto">
            <p className="text-sm text-red-600 dark:text-red-400 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="block w-full max-w-xs mx-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="block w-full max-w-xs mx-auto text-gray-500 dark:text-gray-400 font-medium py-3 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
