import { BottomNav } from '@/components/layout/bottom-nav'

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
    </>
  )
}
