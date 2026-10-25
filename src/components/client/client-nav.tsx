'use client'

// Onglets de navigation client — Mon plan / Mon objectif (si objectif course) / Mon parcours
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ClientNavProps {
  hasGoal?: boolean
}

export function ClientNav({ hasGoal = false }: ClientNavProps) {
  // "Mon objectif" visible uniquement si le client a un objectif course
  const TABS = [
    { href: '/client', label: 'Mon plan' },
    ...(hasGoal ? [{ href: '/client/goal', label: 'Mon objectif' }] : []),
    { href: '/client/parcours', label: 'Mon parcours' },
  ]
  const pathname = usePathname()

  // Déterminer l'onglet actif
  function isActive(href: string) {
    if (href === '/client') {
      // L'onglet "Mon plan" est actif sur /client et les sous-routes /client/session
      // mais pas sur /client/goal, /client/parcours
      return (
        pathname === '/client' ||
        pathname.startsWith('/client/session')
      )
    }
    if (href === '/client/goal') {
      return pathname.startsWith('/client/goal')
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
            className={`flex-1 text-center py-3 min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors ${
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
