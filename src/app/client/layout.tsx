// Layout de l'espace client — navigation avec onglets Programme / Mon parcours
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { ClientNav } from '@/components/client/client-nav'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier la session et récupérer le profil client côté serveur
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      {/* Barre du haut — logo + déconnexion */}
      <nav className="bg-[#1c1c1c] border-b border-[#2a2a2a] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/client" className="flex items-center gap-2.5">
            {/* Logo haltère compact */}
            <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="21.5" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
              <rect x="5.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="19.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
              <rect x="8.5" y="12" width="11" height="4" rx="1" fill="#d4ff00" opacity="0.5"/>
            </svg>
            <div>
              <p className="text-white font-extrabold text-sm tracking-tight">JB COACHING</p>
              <p className="text-[#777] text-xs">{profile?.first_name ?? profile?.full_name}</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </nav>

      {/* Onglets de navigation */}
      <ClientNav />

      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
