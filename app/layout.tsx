import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MatchPost - Share Your Tennis Victories',
  description: 'Record your tennis matches and share to Instagram',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
          {children}
        </div>
      </body>
    </html>
  )
}
