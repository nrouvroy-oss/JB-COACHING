'use client'

// Bouton de déconnexion — utilise le client Supabase côté navigateur
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-600"
    >
      Déconnexion
    </button>
  )
}
