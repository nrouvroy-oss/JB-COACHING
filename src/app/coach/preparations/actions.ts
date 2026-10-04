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
