// Page détail d'une séance : instructions, exercices du programme, suivi
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExerciseItem } from '@/components/client/exercise-item'
import { WorkoutExerciseList } from '@/components/client/workout-exercise-list'
import { SessionDoneButton } from '@/components/client/session-done-button'
import Link from 'next/link'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer la séance avec ses exercices, logs et session_log
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      session_log:session_logs(*),
      session_excluded_exercises(workout_exercise_id),
      session_exercise_details(workout_exercise_id, sets, reps),
      session_exercises(
        *,
        exercise:exercises(*),
        exercise_log:exercise_logs(*)
      )
    `)
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/client')

  // Vérifier si la séance est marquée comme terminée par ce client
  const sessionLogs = session.session_log
  const isSessionDone = Array.isArray(sessionLogs)
    ? sessionLogs.some((l: any) => l.client_id === user.id && l.completed)
    : (sessionLogs as any)?.client_id === user.id && (sessionLogs as any)?.completed

  // Récupérer le programme (workout) et ses exercices si la séance en a un
  let workoutName = ''
  let workoutExercises: any[] = []
  if (session.workout_id) {
    const { data: workout } = await supabase
      .from('workouts')
      .select('name, workout_exercises(*, exercise:exercises(*))')
      .eq('id', session.workout_id)
      .single()

    if (workout) {
      workoutName = workout.name
      const exclusions: string[] = ((session as any).session_excluded_exercises ?? []).map((e: any) => e.workout_exercise_id)
      // Séries/reps personnalisés par séance
      const detailsMap: Record<string, { sets: string; reps: string }> = {}
      for (const d of ((session as any).session_exercise_details ?? [])) {
        detailsMap[d.workout_exercise_id] = { sets: d.sets, reps: d.reps }
      }
      if (workout.workout_exercises) {
        workoutExercises = [...workout.workout_exercises]
          .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((we: any) => ({
            ...we,
            exercise: Array.isArray(we.exercise) ? we.exercise[0] : we.exercise,
            sets: detailsMap[we.id]?.sets ?? '',
            reps: detailsMap[we.id]?.reps ?? '',
          }))
          .filter((we: any) => we.exercise && !exclusions.includes(we.id))
      }
    }
  }

  // Filtrer les logs pour ne garder que ceux appartenant au client connecté
  const exercises = [...session.session_exercises]
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map((se) => ({
      ...se,
      exercise_log: Array.isArray(se.exercise_log)
        ? se.exercise_log.find((l: { client_id: string }) => l.client_id === user.id) ?? null
        : se.exercise_log,
    }))

  return (
    <div>
      {/* Bouton retour */}
      <Link href="/client" className="text-sm text-[#d4ff00] hover:text-[#c2ee00] mb-4 inline-block transition-colors">
        ← Retour
      </Link>

      {/* Bannière simple — nom de la séance + jour */}
      <div className="relative h-20 rounded-xl overflow-hidden mb-4">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-center p-4">
          <h1 className="text-xl font-bold text-white">{session.name}</h1>
          {session.day_of_week && (
            <p className="text-xs text-[#888]">{session.day_of_week}</p>
          )}
        </div>
      </div>

      {/* Bloc programme avec description, récupération, exercices cliquables */}
      {(workoutName || session.details || session.recovery) && (
        <WorkoutExerciseList
          exercises={workoutExercises}
          workoutName={workoutName || session.name}
          sessionId={sessionId}
          details={session.details || undefined}
          recovery={session.recovery || undefined}
        />
      )}

      {/* Exercices individuels de la séance (avec suivi / checkbox) */}
      {exercises.length > 0 && (
        <div className="space-y-3 mt-4">
          {exercises.map((se: { id: string } & Record<string, unknown>) => (
            <ExerciseItem
              key={se.id}
              sessionExercise={se as unknown as Parameters<typeof ExerciseItem>[0]['sessionExercise']}
              clientId={user.id}
            />
          ))}
        </div>
      )}

      {/* Bouton marquer la séance comme terminée */}
      <div className="mt-6">
        <SessionDoneButton sessionId={sessionId} completed={isSessionDone} />
      </div>
    </div>
  )
}
