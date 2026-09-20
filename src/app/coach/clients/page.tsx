// Page liste des clients — requêtes optimisées (une seule requête jointe)
import { createServerClient } from '@/lib/supabase/server'
import { ClientsPageClient } from './clients-page-client'

export default async function ClientsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Récupérer uniquement les clients de ce coach
  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .eq('coach_id', user!.id)

  // UNE requête jointe pour récupérer programmes + exercices + logs (filtrée par coach)
  const { data: activePrograms } = await supabase
    .from('programs')
    .select(`
      id, client_id, status,
      weeks(
        sessions(
          session_exercises(
            id,
            exercise_log:exercise_logs(completed)
          )
        )
      )
    `)
    .eq('status', 'active')
    .eq('coach_id', user!.id)

  // Calculer les stats par client à partir des données jointes
  const clientStats = new Map<string, { status: string; percent: number }>()

  if (activePrograms) {
    for (const program of activePrograms) {
      let totalEx = 0
      let completedEx = 0

      for (const week of (program.weeks ?? [])) {
        for (const session of ((week as any).sessions ?? [])) {
          for (const se of ((session as any).session_exercises ?? [])) {
            totalEx++
            const logs = se.exercise_log
            if (Array.isArray(logs)) {
              if (logs.some((l: any) => l.completed)) completedEx++
            } else if ((logs as any)?.completed) {
              completedEx++
            }
          }
        }
      }

      const percent = totalEx > 0 ? Math.round((completedEx / totalEx) * 100) : 0
      clientStats.set(program.client_id, { status: program.status, percent })
    }
  }

  // Dernière activité par client (une seule requête)
  const { data: lastActivities } = await supabase
    .from('exercise_logs')
    .select('client_id, completed_at')
    .eq('completed', true)
    .order('completed_at', { ascending: false })

  const lastActivityMap = new Map<string, string>()
  if (lastActivities) {
    for (const log of lastActivities) {
      if (!lastActivityMap.has(log.client_id) && log.completed_at) {
        lastActivityMap.set(log.client_id, log.completed_at)
      }
    }
  }

  // Trier par activité récente
  const sortedClients = [...(clients ?? [])].sort((a, b) => {
    const dateA = lastActivityMap.get(a.id)
    const dateB = lastActivityMap.get(b.id)
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return (
    <ClientsPageClient
      clients={sortedClients}
      clientStats={Object.fromEntries(clientStats)}
      lastActivityMap={Object.fromEntries(lastActivityMap)}
    />
  )
}
