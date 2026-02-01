import { Suspense } from 'react'
import DashboardSkeleton from './dashboard-skeleton'
import DashboardClient from './dashboard-client'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  )
}
