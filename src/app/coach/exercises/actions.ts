'use server'

// Server Action pour la suppression d'un exercice
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function deleteExercise(id: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('exercises').delete().eq('id', id)

  // Retourner l'erreur si la suppression échoue
  if (error) return { error: 'Erreur lors de la suppression' }

  // Invalider le cache de la page pour rafraîchir la liste
  revalidatePath('/coach/exercises')
  return {}
}
