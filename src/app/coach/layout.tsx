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
      <div className="bg-[#1c1c1c] px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/coach" className="flex items-center gap-2">
            <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="21.5" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="5.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="19.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="8.5" y="12" width="11" height="4" rx="1" fill="#d4ff00" opacity="0.5"/>
            </svg>
            <div className="flex flex-col items-center leading-none">
              <span className="text-white font-extrabold text-sm tracking-tight">JB</span>
              <span className="text-white font-extrabold text-[8px] tracking-widest">COACHING</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/coach/guide" className="w-5 h-5 rounded-full border border-[#444] text-[#888] hover:border-[#d4ff00] hover:text-[#d4ff00] flex items-center justify-center text-[10px] font-bold transition-colors shrink-0" title="Guide">?</Link>
            <Link href="/coach/profil" className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors">Profil</Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      {/* Onglets de navigation — scrollable sur mobile */}
      <nav className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto px-4">
          <Link href="/coach/clients" className="text-xs text-[#888] hover:text-[#d4ff00] py-2.5 transition-colors whitespace-nowrap">Clients</Link>
          <Link href="/coach/exercises" className="text-xs text-[#888] hover:text-[#d4ff00] py-2.5 transition-colors whitespace-nowrap">Exercices</Link>
          <Link href="/coach/workouts" className="text-xs text-[#888] hover:text-[#d4ff00] py-2.5 transition-colors whitespace-nowrap">Programmes</Link>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
