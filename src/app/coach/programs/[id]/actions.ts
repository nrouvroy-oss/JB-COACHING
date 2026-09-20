'use server'

// Actions serveur pour l'éditeur de modèles de programmes (sans client associé)
// Miroir des actions clients mais revalidant /coach/programs/[id]
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Ajoute une semaine à un modèle de programme
export async function addWeekToTemplate(programId: string, weekNumber: number) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').insert({ program_id: programId, week_number: weekNumber })
  if (error) return { error: "Erreur lors de l'ajout de la semaine" }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Supprime une semaine et toutes ses séances d'un modèle
export async function deleteWeekFromTemplate(weekId: string, programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').delete().eq('id', weekId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Ajoute une séance à une semaine d'un modèle
export async function addSessionToTemplate(weekId: string, name: string, dayOfWeek: string, programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Récupérer le prochain order_index
  const { data: existing } = await supabase
    .from('sessions')
    .select('order_index')
    .eq('week_id', weekId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('sessions')
    .insert({ week_id: weekId, name, day_of_week: dayOfWeek, order_index: nextIndex })

  if (error) return { error: "Erreur lors de l'ajout de la séance" }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Met à jour une séance de modèle (nom, jour, détails, récupération)
export async function updateSessionInTemplate(sessionId: string, name: string, dayOfWeek: string, programId: string, details?: string, recovery?: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('sessions')
    .update({ name, day_of_week: dayOfWeek, details: details ?? '', recovery: recovery ?? '' })
    .eq('id', sessionId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Assigne un programme (workout) à une séance de modèle
export async function assignWorkoutToTemplateSession(sessionId: string, workoutId: string | null, programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('sessions')
    .update({ workout_id: workoutId })
    .eq('id', sessionId)
  if (error) return { error: "Erreur lors de l'assignation" }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Supprime une séance d'un modèle
export async function deleteSessionFromTemplate(sessionId: string, programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Ajoute un exercice à une séance d'un modèle
export async function addExerciseToTemplate(
  sessionId: string,
  exerciseId: string,
  sets: number,
  reps: string,
  restSeconds: number,
  coachNotes: string,
  programId: string,
  durationSeconds?: number | null
) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Récupérer le prochain order_index
  const { data: existing } = await supabase
    .from('session_exercises')
    .select('order_index')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase.from('session_exercises').insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    sets,
    reps,
    rest_seconds: restSeconds,
    duration_seconds: durationSeconds ?? null,
    coach_notes: coachNotes,
    order_index: nextIndex,
  })

  if (error) return { error: "Erreur lors de l'ajout" }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Retire un exercice d'une séance de modèle
export async function removeExerciseFromTemplate(sessionExerciseId: string, programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').delete().eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}

// Met à jour les paramètres d'un exercice dans une séance de modèle
export async function updateTemplateExercise(
  sessionExerciseId: string,
  data: { sets?: number; reps?: string; rest_seconds?: number; duration_seconds?: number | null; coach_notes?: string },
  programId: string
) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').update(data).eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/programs/${programId}`)
  return {}
}
