'use server'

// Actions serveur pour la gestion des exercices dans un programme
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Ajoute un exercice à un programme
export async function addExerciseToWorkout(workoutId: string, exerciseId: string, coachNotes: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Prochain order_index
  const { data: existing } = await supabase
    .from('workout_exercises')
    .select('order_index')
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase.from('workout_exercises').insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    order_index: nextIndex,
    coach_notes: coachNotes,
  })

  if (error) return { error: "Erreur lors de l'ajout" }
  revalidatePath(`/coach/workouts/${workoutId}`)
  return {}
}

// Retire un exercice d'un programme
export async function removeExerciseFromWorkout(workoutExerciseId: string, workoutId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/workouts/${workoutId}`)
  return {}
}

// Met à jour les notes d'un exercice dans un programme
export async function updateWorkoutExercise(workoutExerciseId: string, coachNotes: string, workoutId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('workout_exercises')
    .update({ coach_notes: coachNotes })
    .eq('id', workoutExerciseId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/workouts/${workoutId}`)
  return {}
}
