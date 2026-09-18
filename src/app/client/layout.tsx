// Layout de l'espace client — affiche le nom du client et protège les routes
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <p className="text-lg font-bold text-gray-900">Mon Programme</p>
          <p className="text-sm text-gray-500">{profile?.full_name}</p>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
