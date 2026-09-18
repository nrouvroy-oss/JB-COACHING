'use server'

// Actions serveur pour la gestion des programmes, semaines, séances et exercices
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Crée un nouveau programme actif pour un client (désactive les anciens)
export async function createProgram(clientId: string, name: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Désactiver les anciens programmes de ce client
  await supabase
    .from('programs')
    .update({ status: 'completed' })
    .eq('client_id', clientId)
    .eq('status', 'active')

  const { error } = await supabase
    .from('programs')
    .insert({ name, client_id: clientId, coach_id: user.id })

  if (error) return { error: 'Erreur lors de la création' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Ajoute une semaine à un programme
export async function addWeek(programId: string, weekNumber: number, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').insert({ program_id: programId, week_number: weekNumber })
  if (error) return { error: "Erreur lors de l'ajout de la semaine" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Supprime une semaine et toutes ses séances
export async function deleteWeek(weekId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').delete().eq('id', weekId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Ajoute une séance à une semaine avec le prochain order_index disponible
export async function addSession(weekId: string, name: string, dayOfWeek: string, clientId: string) {
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
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Supprime une séance et tous ses exercices
export async function deleteSession(sessionId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Ajoute un exercice à une séance avec les paramètres (séries, reps, repos, notes)
export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string,
  sets: number,
  reps: string,
  restSeconds: number,
  coachNotes: string,
  clientId: string
) {
  const supabase = await createServerClient()

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
    coach_notes: coachNotes,
    order_index: nextIndex,
  })

  if (error) return { error: "Erreur lors de l'ajout" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Retire un exercice d'une séance
export async function removeExerciseFromSession(sessionExerciseId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').delete().eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Met à jour les paramètres d'un exercice dans une séance
export async function updateSessionExercise(
  sessionExerciseId: string,
  data: { sets?: number; reps?: string; rest_seconds?: number; coach_notes?: string },
  clientId: string
) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').update(data).eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}
