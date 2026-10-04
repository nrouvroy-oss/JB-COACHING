'use server'

// Action serveur pour assigner un sportif au coach par défaut après inscription
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'

export async function assignToDefaultCoach() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const admin = createAdminClient()

  // Trouver le premier coach (JB pour le MVP)
  const { data: coach } = await admin
    .from('profiles')
    .select('id')
    .eq('role', 'coach')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!coach) return { error: 'Aucun coach disponible' }

  // Assigner le sportif au coach via service_role (bypass RLS)
  const { error } = await admin
    .from('profiles')
    .update({ coach_id: coach.id })
    .eq('id', user.id)

  if (error) return { error: 'Erreur lors de l\'assignation' }

  return {}
}
