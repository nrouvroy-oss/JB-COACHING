// Layout de l'espace coach — navigation et protection côté serveur
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation mobile-first */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/coach" className="text-lg font-bold text-gray-900">
            Coach JB
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/coach" className="text-sm text-gray-600 hover:text-gray-900">
              Clients
            </Link>
            <Link href="/coach/exercises" className="text-sm text-gray-600 hover:text-gray-900">
              Exercices
            </Link>
            {/* Bouton de déconnexion dans la navigation */}
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
