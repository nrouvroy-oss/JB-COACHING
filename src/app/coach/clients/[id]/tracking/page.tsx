// Page de suivi d'un client — affiche ses feedbacks et sa progression par exercice
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrackingView } from '@/components/coach/tracking-view'
import Link from 'next/link'

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  // Récupérer le profil du client
  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  // Récupérer le programme actif avec tous les logs d'exercices
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      weeks(
        *,
        sessions(
          *,
          session_exercises(
            *,
            exercise:exercises(*),
            exercise_log:exercise_logs(*)
          )
        )
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  // Reformater les logs pour ne garder que ceux du client concerné
  const weeks = program?.weeks.map((week: any) => ({
    ...week,
    sessions: week.sessions.map((session: any) => ({
      ...session,
      session_exercises: session.session_exercises.map((se: any) => ({
        ...se,
        exercise_log: Array.isArray(se.exercise_log)
          ? se.exercise_log.find((l: any) => l.client_id === clientId) ?? null
          : se.exercise_log,
      })),
    })),
  })) ?? []

  return (
    <div>
      {/* Navigation entre les vues coach */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/coach/clients/${clientId}/program`} className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
          ← Plan
        </Link>
        <Link href="/coach" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
          Tableau de bord →
        </Link>
      </div>
      {/* Passe le nom complet construit depuis first_name/last_name, repli sur full_name */}
      <TrackingView
        weeks={weeks}
        clientName={
          (client.first_name && client.last_name)
            ? `${client.first_name} ${client.last_name}`
            : client.full_name
        }
      />
    </div>
  )
}
