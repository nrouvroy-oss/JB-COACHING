import { createServerClient } from '@/lib/supabase/server'

// Verifie que l'utilisateur connecte est un coach — retourne le user ou null
export async function requireCoach() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') return null
  return user
}
