import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-dvh h-dvh overflow-auto relative flex flex-col items-center justify-center p-6 text-white bg-gray-900">
      {/* Background Image */}
      <Image
        src="/login-bg-compressed.jpg"
        alt="Tennis Stadium"
        fill
        className="object-cover"
        priority
        placeholder="empty"
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full">
        <div className="text-center mb-12">
          <h1 className="font-outfit text-5xl font-black mb-2 tracking-wider uppercase">
            <span className="text-white">MATCH</span>
            <span className="text-yellow-400">POST</span>
          </h1>
          <p className="text-white/80 text-lg font-outfit">Record. Share. Compete.</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-2xl shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transition-all hover:scale-105 text-center"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-white/20 backdrop-blur text-white font-semibold py-4 px-6 rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all text-center"
          >
            Continue as Guest
          </Link>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <p className="text-white/70 text-[10px] font-outfit uppercase tracking-widest">
          Cooked by{' '}
          <a
            href="https://bayuslari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:text-white transition-colors"
          >
            bayuslari.com
          </a>
        </p>
      </div>

      {/* Bottom safe area cover for iOS */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 z-0" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  )
}
