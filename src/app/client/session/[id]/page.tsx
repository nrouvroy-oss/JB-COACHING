// Page détail d'une séance : liste des exercices avec suivi et feedback
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExerciseItem } from '@/components/client/exercise-item'
import { ProgressBar } from '@/components/ui/progress-bar'
import Link from 'next/link'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer la séance avec ses exercices et les logs du client connecté
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      session_exercises(
        *,
        exercise:exercises(*),
        exercise_log:exercise_logs(*)
      )
    `)
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/client')

  // Filtrer les logs pour ne garder que ceux appartenant au client connecté
  const exercises = session.session_exercises
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map((se: {
      exercise_log: Array<{ client_id: string; completed?: boolean; feedback?: string | null }> | { client_id: string; completed?: boolean; feedback?: string | null } | null
    } & Record<string, unknown>) => ({
      ...se,
      exercise_log: Array.isArray(se.exercise_log)
        ? se.exercise_log.find((l) => l.client_id === user.id) ?? null
        : se.exercise_log,
    }))

  const total = exercises.length
  const completed = exercises.filter((e: { exercise_log?: { completed?: boolean } | null }) => e.exercise_log?.completed).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      {/* Bouton retour vers la liste du programme */}
      <Link href="/client" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Retour
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
        {session.day_of_week && (
          <p className="text-sm text-gray-500">{session.day_of_week}</p>
        )}
      </div>

      {/* Barre de progression globale de la séance */}
      <div className="flex items-center gap-3 mb-6">
        <ProgressBar percent={percent} className="flex-1" />
        <span className="text-sm font-medium text-gray-500">{completed}/{total}</span>
      </div>

      {/* Liste des exercices */}
      <div className="space-y-3">
        {exercises.map((se: { id: string } & Record<string, unknown>) => (
          <ExerciseItem
            key={se.id}
            sessionExercise={se as unknown as Parameters<typeof ExerciseItem>[0]['sessionExercise']}
            clientId={user.id}
          />
        ))}
      </div>
    </div>
  )
}
