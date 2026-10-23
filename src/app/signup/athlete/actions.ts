'use server'

// Action serveur pour créer le profil client et assigner au coach par défaut
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'

export async function ensureClientProfileAndAssign() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const admin = createAdminClient()

  // Vérifier si le profil existe déjà (créé par le trigger)
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existing) {
    // Vérifier que le rôle est bien client (pas un coach qui tente de se créer un profil client)
    if (user.user_metadata?.role && user.user_metadata.role !== 'client') {
      return { error: 'Rôle invalide pour cette inscription' }
    }

    // Créer le profil manuellement si le trigger n'a pas fonctionné
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
        role: 'client',
      })

    if (profileError) return { error: 'Erreur création profil : ' + profileError.message }
  }

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

// Alias pour compatibilité
export const assignToDefaultCoach = ensureClientProfileAndAssign
