// Tableau de bord coach — requêtes optimisées
import { createServerClient } from '@/lib/supabase/server'
import { CoachDashboardClient } from './dashboard-client'
import { getMondayOfThisWeek } from '@/lib/date-utils'

export default async function CoachDashboard() {
  const supabase = await createServerClient()

  // Récupérer le prénom du coach
  const { data: { user } } = await supabase.auth.getUser()
  const { data: coachProfile } = user ? await supabase
    .from('profiles')
    .select('first_name, full_name')
    .eq('id', user.id)
    .single() : { data: null }

  const coachFirstName = coachProfile?.first_name ?? coachProfile?.full_name?.split(' ')[0] ?? 'Coach'

  // ── 1. Les clients de ce coach ──
  const { data: allClients } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name')
    .eq('role', 'client')
    .eq('coach_id', user!.id)

  const clientCount = allClients?.length ?? 0

  // IDs des clients de ce coach (pour filtrer les requêtes suivantes)
  const myClientIds = (allClients ?? []).map(c => c.id)

  // ── 2. Feedbacks récents (7 jours) — uniquement les clients de ce coach ──
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentFeedbackCount } = myClientIds.length > 0
    ? await supabase
        .from('exercise_logs')
        .select('*', { count: 'exact', head: true })
        .not('feedback', 'is', null)
        .gte('completed_at', sevenDaysAgo)
        .in('client_id', myClientIds)
    : { count: 0 }

  // ── 3. Clients actifs cette semaine + inactifs ──
  const mondayDate = getMondayOfThisWeek()
  const { data: activeSessionLogs } = myClientIds.length > 0
    ? await supabase
        .from('session_logs')
        .select('client_id')
        .eq('completed', true)
        .gte('completed_at', mondayDate)
        .in('client_id', myClientIds)
    : { data: [] }

  const activeClientIds = new Set((activeSessionLogs ?? []).map(l => l.client_id))
  const activeThisWeek = activeClientIds.size

  // Dernière activité de chaque client (pour les inactifs)
  const { data: allSessionLogs } = myClientIds.length > 0
    ? await supabase
        .from('session_logs')
        .select('client_id, completed_at')
        .eq('completed', true)
        .in('client_id', myClientIds)
        .order('completed_at', { ascending: false })
    : { data: [] }

  const lastActivityMap = new Map<string, string>()
  if (allSessionLogs) {
    for (const log of allSessionLogs) {
      if (!lastActivityMap.has(log.client_id) && log.completed_at) {
        lastActivityMap.set(log.client_id, log.completed_at)
      }
    }
  }

  // Construire la liste des clients inactifs cette semaine
  const inactiveClients = (allClients ?? [])
    .filter(c => !activeClientIds.has(c.id))
    .map(c => ({
      id: c.id,
      name: (c.first_name && c.last_name) ? `${c.first_name} ${c.last_name}` : c.full_name,
      lastActivity: lastActivityMap.get(c.id) ?? null,
    }))
    .sort((a, b) => {
      // Jamais connectés en dernier, sinon par date décroissante
      if (!a.lastActivity && !b.lastActivity) return 0
      if (!a.lastActivity) return 1
      if (!b.lastActivity) return -1
      return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
    })

  // ── 4. Les 5 derniers feedbacks ──
  const { data: recentFeedbacks } = await supabase
    .from('exercise_logs')
    .select(`
      id,
      feedback,
      completed_at,
      client:profiles!client_id(id, full_name, first_name, last_name),
      session_exercise:session_exercises!session_exercise_id(
        exercise:exercises(name)
      )
    `)
    .not('feedback', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5)

  // ── 5. Dernier client actif (pour le raccourci) ──
  const { data: lastActiveLog } = await supabase
    .from('exercise_logs')
    .select('client_id')
    .eq('completed', true)
    .order('completed_at', { ascending: false })
    .limit(1)

  let lastActiveClient = null
  if (lastActiveLog && lastActiveLog.length > 0) {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', lastActiveLog[0].client_id)
      .single()
    lastActiveClient = clientProfile
  }

  if (!lastActiveClient && allClients && allClients.length > 0) {
    const { data: firstClient } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', allClients[0].id)
      .single()
    lastActiveClient = firstClient
  }

  return (
    <CoachDashboardClient
      stats={{
        clientCount,
        activeThisWeek,
        recentFeedbackCount: recentFeedbackCount ?? 0,
      }}
      recentFeedbacks={recentFeedbacks ?? []}
      lastActiveClient={lastActiveClient}
      inactiveClients={inactiveClients}
      coachFirstName={coachFirstName}
    />
  )
}
