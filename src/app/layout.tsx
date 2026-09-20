// Layout racine de l'application Coach JB
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JB COACHING',
  description: 'Coaching sportif personnalisé',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-[#1c1c1c] min-h-screen">
        {children}
      </body>
    </html>
  )
}
