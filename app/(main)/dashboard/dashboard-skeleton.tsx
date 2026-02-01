// Server Component - renders statically for instant FCP
export default function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-yellow-500 text-gray-900 px-6 pb-20 rounded-b-3xl header-safe-area">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 w-20 bg-yellow-600/30 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-32 bg-yellow-600/30 rounded animate-pulse"></div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="h-9 w-12 bg-yellow-600/30 rounded mx-auto animate-pulse mb-1"></div>
              <div className="h-3 w-14 bg-yellow-600/30 rounded mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4">
            <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-700 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 pb-24">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-1.5 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
