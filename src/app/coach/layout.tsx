// Layout de l'espace coach — navigation sombre sportive et protection côté serveur
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier la session côté serveur pour une sécurité maximale
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      {/* Barre du haut — logo + profil + déconnexion */}
      <div className="bg-[#1c1c1c] px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/coach" className="flex items-center gap-2 min-h-[44px]">
            <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="21.5" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="5.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="19.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="8.5" y="12" width="11" height="4" rx="1" fill="#d4ff00" opacity="0.5"/>
            </svg>
            <span className="text-white font-extrabold text-sm tracking-tight">KTRY</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/coach/guide" className="w-10 h-10 rounded-full border border-[#444] text-[#888] hover:border-[#d4ff00] hover:text-[#d4ff00] flex items-center justify-center text-xs font-bold transition-colors shrink-0" aria-label="Guide d'utilisation">?</Link>
            <Link href="/coach/profil" className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors px-2 min-h-[44px] flex items-center">Profil</Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      {/* Onglets de navigation */}
      <nav className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
        <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto px-3 sm:px-4">
          <Link href="/coach/clients" className="text-sm text-[#888] hover:text-[#d4ff00] py-3 transition-colors whitespace-nowrap min-h-[44px] flex items-center">Clients</Link>
          <Link href="/coach/exercises" className="text-sm text-[#888] hover:text-[#d4ff00] py-3 transition-colors whitespace-nowrap min-h-[44px] flex items-center">Exercices</Link>
          <Link href="/coach/workouts" className="text-sm text-[#888] hover:text-[#d4ff00] py-3 transition-colors whitespace-nowrap min-h-[44px] flex items-center">Programmes</Link>
          <Link href="/coach/preparations" className="text-sm text-[#888] hover:text-[#d4ff00] py-3 transition-colors whitespace-nowrap min-h-[44px] flex items-center">Prépas</Link>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-3 sm:p-4 pb-6">
        {children}
      </main>
    </div>
  )
}
