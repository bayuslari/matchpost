import { BottomNav } from '@/components/layout/bottom-nav'
import { AchievementToast } from '@/components/achievements/achievement-toast'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
      <AchievementToast />
    </>
  )
}
