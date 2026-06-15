import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Church Member Registry',
  description: 'Manage your congregation digitally',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50 relative overflow-x-hidden">
        <div className="paper-overlay" />
        {children}
      </body>
    </html>
  )
}
