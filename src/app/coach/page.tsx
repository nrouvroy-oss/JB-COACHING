// Tableau de bord coach — récupère les données côté serveur et délègue l'affichage au composant client
import { createServerClient } from '@/lib/supabase/server'
import { CoachDashboardClient } from './dashboard-client'

export default async function CoachDashboard() {
  const supabase = await createServerClient()

  // Récupérer tous les clients triés par nom
  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('full_name')

  // Récupérer les programmes actifs avec leurs statistiques de complétion
  const { data: programs } = await supabase
    .from('programs')
    .select('id, client_id, status')
    .eq('status', 'active')

  // Calculer le pourcentage de complétion pour chaque programme actif
  const clientStats = new Map<string, { status: string; percent: number }>()

  if (programs) {
    for (const program of programs) {
      // Récupérer les IDs des semaines du programme
      const { data: weeks } = await supabase
        .from('weeks')
        .select('id')
        .eq('program_id', program.id)

      const weekIds = weeks?.map(w => w.id) ?? []

      // Récupérer les IDs des séances liées à ces semaines
      const { data: sessions } = weekIds.length > 0
        ? await supabase
            .from('sessions')
            .select('id')
            .in('week_id', weekIds)
        : { data: [] }

      const sessionIds = sessions?.map(s => s.id) ?? []

      // Compter le total d'exercices dans le programme
      const { count: totalExercises } = sessionIds.length > 0
        ? await supabase
            .from('session_exercises')
            .select('id', { count: 'exact', head: true })
            .in('session_id', sessionIds)
        : { count: 0 }

      // Compter les exercices complétés par le client
      const { count: completedExercises } = await supabase
        .from('exercise_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', program.client_id)
        .eq('completed', true)

      const percent = totalExercises
        ? Math.round(((completedExercises ?? 0) / totalExercises) * 100)
        : 0

      clientStats.set(program.client_id, { status: program.status, percent })
    }
  }

  return (
    <CoachDashboardClient
      clients={clients ?? []}
      clientStats={Object.fromEntries(clientStats)}
    />
  )
}
