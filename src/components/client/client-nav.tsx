'use client'

// Onglets de navigation client — Programme / Mon parcours
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/client', label: 'Programme' },
  { href: '/client/parcours', label: 'Mon parcours' },
]

export function ClientNav() {
  const pathname = usePathname()

  // Déterminer l'onglet actif (Programme = tout sauf /parcours)
  function isActive(href: string) {
    if (href === '/client') {
      return pathname === '/client' || pathname.startsWith('/client/session')
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
      <div className="max-w-lg mx-auto flex">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-2.5 text-sm font-medium transition-colors ${
              isActive(tab.href)
                ? 'text-[#d4ff00] border-b-2 border-[#d4ff00]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
