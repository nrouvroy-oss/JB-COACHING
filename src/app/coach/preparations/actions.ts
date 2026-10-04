'use server'

// Actions serveur pour la gestion des préparations course côté coach
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Publier la préparation — passe le statut en 'active' (le plan est prêt pour le sportif)
export async function publishPreparation(goalId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('race_goals')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', goalId)

  if (error) return { error: 'Erreur lors de la publication' }

  revalidatePath('/coach/preparations')
  revalidatePath(`/coach/preparations/${goalId}`)
  return {}
}

// Créer le plan de préparation — crée un programme lié au race_goal et redirige
export async function createPreparationPlan(goalId: string, clientId: string, raceName: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Archiver l'ancien programme actif du client s'il y en a un
  await supabase
    .from('programs')
    .update({ status: 'completed' })
    .eq('client_id', clientId)
    .eq('status', 'active')

  // Créer le programme lié au race_goal
  const { data: program, error: progError } = await supabase
    .from('programs')
    .insert({
      name: `Préparation — ${raceName}`,
      client_id: clientId,
      coach_id: user.id,
      race_goal_id: goalId,
      status: 'active',
    })
    .select('id')
    .single()

  if (progError || !program) return { error: 'Erreur lors de la création du plan' }

  revalidatePath('/coach/preparations')
  revalidatePath(`/coach/preparations/${goalId}`)
  revalidatePath(`/coach/clients/${clientId}/program`)
  return { programId: program.id, clientId }
}

// Terminer la préparation — passe le statut en 'completed' (la course est passée)
export async function completePreparation(goalId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('race_goals')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', goalId)

  if (error) return { error: 'Erreur lors de la clôture' }

  revalidatePath('/coach/preparations')
  revalidatePath(`/coach/preparations/${goalId}`)
  return {}
}
