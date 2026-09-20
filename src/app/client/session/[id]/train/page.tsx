// Page serveur — récupère les données du workout puis passe au composant client
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrainMode } from './train-mode'

export default async function TrainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer la séance avec les exclusions et détails
  const { data: session } = await supabase
    .from('sessions')
    .select('*, session_excluded_exercises(workout_exercise_id), session_exercise_details(workout_exercise_id, sets, reps)')
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/client')

  // Récupérer les exercices du workout en filtrant les exclusions
  let workoutExercises: any[] = []
  let workoutName = ''
  if (session.workout_id) {
    const { data: workout } = await supabase
      .from('workouts')
      .select('name, workout_exercises(*, exercise:exercises(id, name, video_url, description))')
      .eq('id', session.workout_id)
      .single()

    if (workout) {
      workoutName = workout.name
      const exclusions: string[] = ((session as any).session_excluded_exercises ?? []).map((e: any) => e.workout_exercise_id)
      const detailsMap: Record<string, { sets: string; reps: string }> = {}
      for (const d of ((session as any).session_exercise_details ?? [])) {
        detailsMap[d.workout_exercise_id] = { sets: d.sets, reps: d.reps }
      }
      workoutExercises = [...(workout.workout_exercises || [])]
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

  // Si pas d'exercices, retour à la séance
  if (workoutExercises.length === 0) redirect(`/client/session/${sessionId}`)

  return (
    <TrainMode
      sessionId={sessionId}
      sessionName={session.name}
      workoutName={workoutName}
      details={session.details || ''}
      recovery={session.recovery || ''}
      exercises={workoutExercises}
    />
  )
}
