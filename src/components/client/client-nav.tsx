'use client'

// Onglets de navigation client — Mon plan / Mon objectif (conditionnel) / Mon parcours
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  // Afficher l'onglet "Mon objectif" seulement si le client a un objectif actif
  hasGoal?: boolean
}

// Onglets fixes (toujours présents)
const BASE_TABS = [
  { href: '/client', label: 'Mon plan' },
  { href: '/client/parcours', label: 'Mon parcours' },
]

// Onglet objectif (conditionnel, inséré entre les deux onglets fixes)
const GOAL_TAB = { href: '/client/goal', label: 'Mon objectif' }

export function ClientNav({ hasGoal = false }: Props) {
  const pathname = usePathname()

  // Construire la liste des onglets selon la présence d'un objectif actif
  const tabs = hasGoal
    ? [BASE_TABS[0], GOAL_TAB, BASE_TABS[1]]
    : BASE_TABS

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
        {tabs.map((tab) => (
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
