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

  // Récupérer programmes actifs avec session_logs pour calculer la progression
  const { data: activePrograms } = await supabase
    .from('programs')
    .select(`
      id, client_id, status,
      weeks(
        sessions(
          id,
          session_log:session_logs(client_id, completed, completed_at)
        )
      )
    `)
    .eq('status', 'active')
    .eq('coach_id', user!.id)

  // Calculer les stats par client — basé sur les séances terminées (session_logs)
  const clientStats = new Map<string, { status: string; percent: number }>()

  if (activePrograms) {
    for (const program of activePrograms) {
      let totalSessions = 0
      let completedSessions = 0

      for (const week of (program.weeks ?? [])) {
        for (const session of ((week as any).sessions ?? [])) {
          totalSessions++
          const logs = session.session_log
          if (Array.isArray(logs)) {
            if (logs.some((l: any) => l.completed)) completedSessions++
          } else if ((logs as any)?.completed) {
            completedSessions++
          }
        }
      }

      const percent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      clientStats.set(program.client_id, { status: program.status, percent })
    }
  }

  // Dernière activité par client — basé sur session_logs
  const myClientIds = (clients ?? []).map(c => c.id)
  const { data: lastActivities } = myClientIds.length > 0
    ? await supabase
        .from('session_logs')
        .select('client_id, completed_at')
        .eq('completed', true)
        .in('client_id', myClientIds)
        .order('completed_at', { ascending: false })
    : { data: [] }

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

  // Vérifier le statut d'abonnement pour la limite freemium
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('coach_id', user!.id)
    .single()

  const isPro = subscription?.status === 'active'

  return (
    <ClientsPageClient
      clients={sortedClients}
      clientStats={Object.fromEntries(clientStats)}
      lastActivityMap={Object.fromEntries(lastActivityMap)}
      maxClients={isPro ? null : 3}
    />
  )
}
