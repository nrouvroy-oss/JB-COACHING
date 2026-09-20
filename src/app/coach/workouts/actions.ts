'use server'

// Actions serveur pour la gestion des programmes (blocs réutilisables d'exercices)
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Crée un nouveau programme
export async function createWorkout(name: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('workouts')
    .insert({ name, coach_id: user.id })
    .select()
    .single()

  if (error) return { error: 'Erreur lors de la création' }
  revalidatePath('/coach/workouts')
  return { id: data.id }
}

// Renomme un programme
export async function renameWorkout(workoutId: string, newName: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('workouts')
    .update({ name: newName })
    .eq('id', workoutId)
  if (error) return { error: 'Erreur lors du renommage' }
  revalidatePath('/coach/workouts')
  return {}
}

// Supprime un programme
export async function deleteWorkout(workoutId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath('/coach/workouts')
  return {}
}
