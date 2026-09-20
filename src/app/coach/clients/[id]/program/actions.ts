'use server'

// Actions serveur pour la gestion des programmes, semaines, séances et exercices
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Crée un nouveau programme actif pour un client (désactive les anciens)
export async function createProgram(clientId: string, name: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

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

// Supprime un programme et toutes ses données (semaines, séances, exercices, logs)
export async function deleteProgram(programId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('programs').delete().eq('id', programId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Renomme un programme
export async function renameProgram(programId: string, newName: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('programs')
    .update({ name: newName })
    .eq('id', programId)
  if (error) return { error: 'Erreur lors du renommage' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Met à jour les séries/reps d'un exercice pour une séance spécifique
export async function updateExerciseDetails(sessionId: string, workoutExerciseId: string, sets: string, reps: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('session_exercise_details')
    .upsert(
      { session_id: sessionId, workout_exercise_id: workoutExerciseId, sets, reps },
      { onConflict: 'session_id,workout_exercise_id' }
    )
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Masque un exercice du programme pour cette séance uniquement (ne touche pas au template)
export async function excludeWorkoutExercise(sessionId: string, workoutExerciseId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('session_excluded_exercises')
    .insert({ session_id: sessionId, workout_exercise_id: workoutExerciseId })
  if (error) return { error: "Erreur lors de l'exclusion" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Réintègre un exercice précédemment masqué
export async function includeWorkoutExercise(sessionId: string, workoutExerciseId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('session_excluded_exercises')
    .delete()
    .eq('session_id', sessionId)
    .eq('workout_exercise_id', workoutExerciseId)
  if (error) return { error: 'Erreur lors de la réintégration' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Assigne un programme (workout) à une séance
export async function assignWorkoutToSession(sessionId: string, workoutId: string | null, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('sessions')
    .update({ workout_id: workoutId })
    .eq('id', sessionId)
  if (error) return { error: "Erreur lors de l'assignation" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Ajoute une semaine à un programme
export async function addWeek(programId: string, weekNumber: number, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').insert({ program_id: programId, week_number: weekNumber })
  if (error) return { error: "Erreur lors de l'ajout de la semaine" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Supprime une semaine et toutes ses séances
export async function deleteWeek(weekId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').delete().eq('id', weekId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Ajoute une séance à une semaine avec le prochain order_index disponible
export async function addSession(weekId: string, name: string, dayOfWeek: string, clientId: string) {
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
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Met à jour une séance (nom, jour, détails, récupération)
export async function updateSession(sessionId: string, name: string, dayOfWeek: string, clientId: string, details?: string, recovery?: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('sessions')
    .update({ name, day_of_week: dayOfWeek, details: details ?? '', recovery: recovery ?? '' })
    .eq('id', sessionId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Supprime une séance et tous ses exercices
export async function deleteSession(sessionId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

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
  clientId: string,
  durationSeconds?: number | null
) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

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
    duration_seconds: durationSeconds ?? null,
    coach_notes: coachNotes,
    order_index: nextIndex,
  })

  if (error) return { error: "Erreur lors de l'ajout" }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Retire un exercice d'une séance
export async function removeExerciseFromSession(sessionExerciseId: string, clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').delete().eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Duplique un programme existant pour un autre client
export async function duplicateProgram(sourceProgramId: string, clientId: string, newName: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Désactiver les anciens programmes du client
  await supabase
    .from('programs')
    .update({ status: 'completed' })
    .eq('client_id', clientId)
    .eq('status', 'active')

  // Créer le nouveau programme
  const { data: newProgram, error: progError } = await supabase
    .from('programs')
    .insert({ name: newName, client_id: clientId, coach_id: user.id })
    .select()
    .single()

  if (progError || !newProgram) return { error: 'Erreur lors de la création du programme' }

  // Récupérer le programme source avec toutes ses données
  const { data: source } = await supabase
    .from('programs')
    .select(`
      weeks(
        *,
        sessions(
          *,
          session_exercises(*)
        )
      )
    `)
    .eq('id', sourceProgramId)
    .single()

  if (!source?.weeks) return { error: 'Programme source introuvable' }

  // Dupliquer semaines → séances → exercices
  for (const week of source.weeks) {
    const { data: newWeek } = await supabase
      .from('weeks')
      .insert({ program_id: newProgram.id, week_number: week.week_number })
      .select()
      .single()

    if (!newWeek) continue

    for (const session of (week as any).sessions || []) {
      const { data: newSession } = await supabase
        .from('sessions')
        .insert({
          week_id: newWeek.id,
          name: session.name,
          day_of_week: session.day_of_week,
          order_index: session.order_index,
          details: session.details ?? '',
          recovery: session.recovery ?? '',
        })
        .select()
        .single()

      if (!newSession) continue

      for (const se of (session as any).session_exercises || []) {
        await supabase.from('session_exercises').insert({
          session_id: newSession.id,
          exercise_id: se.exercise_id,
          sets: se.sets,
          reps: se.reps,
          rest_seconds: se.rest_seconds,
          coach_notes: se.coach_notes,
          order_index: se.order_index,
        })
      }
    }
  }

  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

// Met à jour les paramètres d'un exercice dans une séance
export async function updateSessionExercise(
  sessionExerciseId: string,
  data: { sets?: number; reps?: string; rest_seconds?: number; duration_seconds?: number | null; coach_notes?: string },
  clientId: string
) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').update(data).eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}
