import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Logo */}
        <h1 className="font-outfit text-3xl font-black mb-8 tracking-wider uppercase">
          <span className="text-gray-800 dark:text-white">MATCH</span>
          <span className="text-yellow-500">POST</span>
        </h1>

        {/* 404 Display */}
        <div className="text-8xl font-black text-gray-200 dark:text-gray-700 mb-4">
          404
        </div>

        {/* Tennis Ball Icon */}
        <div className="text-6xl mb-6">
          🎾
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Out of Bounds!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
          Looks like this shot went wide. The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full max-w-xs mx-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-[1.02] transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full max-w-xs mx-auto text-gray-500 dark:text-gray-400 font-medium py-3 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
