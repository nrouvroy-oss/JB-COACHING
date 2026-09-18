// Page principale de l'espace client — charge le programme actif du client
import { createServerClient } from '@/lib/supabase/server'
import { ClientProgramView } from './program-view'

export default async function ClientProgramPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer le programme actif avec toutes les relations imbriquées
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
    .eq('client_id', user.id)
    .eq('status', 'active')
    .single()

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun programme pour le moment.</p>
        <p className="text-sm text-gray-400 mt-2">Ton coach te préparera bientôt un programme !</p>
      </div>
    )
  }

  return <ClientProgramView program={program} />
}
