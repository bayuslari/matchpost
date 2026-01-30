import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-yellow-400 flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-12">
        <div className="text-7xl mb-4">🎾</div>
        <h1 className="text-5xl font-black mb-2 tracking-tight">MatchPost</h1>
        <p className="text-green-100 text-lg">Record. Share. Compete.</p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <Link 
          href="/login"
          className="block w-full bg-white text-green-600 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
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

      <div className="mt-16 flex gap-8 text-center text-sm text-green-100">
        <div>
          <div className="text-3xl font-bold text-white">10K+</div>
          <div>Matches</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">2K+</div>
          <div>Players</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">500+</div>
          <div>Groups</div>
        </div>
      </div>
    </div>
  )
}
