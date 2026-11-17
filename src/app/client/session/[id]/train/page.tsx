// Page serveur — récupère les exercices (workout OU session_exercises) puis passe au composant client
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrainMode } from './train-mode'

export default async function TrainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, session_excluded_exercises(workout_exercise_id), session_exercise_details(workout_exercise_id, sets, reps), session_exercises(*, exercise:exercises(id, name, video_url, description))')
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/client')

  let trainExercises: any[] = []
  let trainName = session.name

  // Priorité 1 : exercices du workout assigné (ancien système)
  if (session.workout_id) {
    const { data: workout } = await supabase
      .from('workouts')
      .select('name, workout_exercises(*, exercise:exercises(id, name, video_url, description))')
      .eq('id', session.workout_id)
      .single()

    if (workout) {
      trainName = workout.name
      const exclusions: string[] = ((session as any).session_excluded_exercises ?? []).map((e: any) => e.workout_exercise_id)
      const detailsMap: Record<string, { sets: string; reps: string }> = {}
      for (const d of ((session as any).session_exercise_details ?? [])) {
        detailsMap[d.workout_exercise_id] = { sets: d.sets, reps: d.reps }
      }
      trainExercises = [...(workout.workout_exercises || [])]
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((we: any) => ({
          id: we.id,
          coach_notes: we.coach_notes,
          sets: detailsMap[we.id]?.sets ?? '',
          reps: detailsMap[we.id]?.reps ?? '',
          exercise: Array.isArray(we.exercise) ? we.exercise[0] : we.exercise,
        }))
        .filter((we: any) => we.exercise && !exclusions.includes(we.id))
    }
  }

  // Priorité 2 : exercices directs de la séance (session_exercises)
  if (trainExercises.length === 0 && session.session_exercises?.length > 0) {
    trainExercises = [...session.session_exercises]
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((se: any) => ({
        id: se.id,
        coach_notes: se.coach_notes || '',
        sets: se.sets > 0 ? String(se.sets) : '',
        reps: se.reps !== '0' ? se.reps : '',
        exercise: Array.isArray(se.exercise) ? se.exercise[0] : se.exercise,
      }))
      .filter((se: any) => se.exercise)
  }

  if (trainExercises.length === 0) redirect(`/client/session/${sessionId}`)

  return (
    <TrainMode
      sessionId={sessionId}
      sessionName={session.name}
      workoutName={trainName}
      details={session.details || ''}
      recovery={session.recovery || ''}
      exercises={trainExercises}
    />
  )
}
