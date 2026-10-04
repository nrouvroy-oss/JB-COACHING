// Page liste des préparations course — côté coach
// Requête les race_goals des clients du coach avec profil trail et infos sportif
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PreparationsList } from './preparations-list'
import type { RaceGoalWithProfile } from '@/lib/types'

export default async function PreparationsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirection si non connecté
  if (!user) redirect('/login')

  // Étape 1 : récupérer les IDs des clients rattachés à ce coach
  const { data: coachClients } = await supabase
    .from('profiles')
    .select('id')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  const clientIds = (coachClients ?? []).map((c) => c.id)

  // Étape 2 : requête principale — race_goals où coach_id = moi OU client dans mes sportifs
  // La RLS Supabase filtre également côté serveur pour la sécurité
  const { data: allGoals } = await supabase
    .from('race_goals')
    .select(`
      *,
      athlete_trail_profile:athlete_trail_profiles(*),
      client:profiles!race_goals_client_id_fkey(
        id, full_name, first_name, last_name, email, role, created_at, coach_id
      )
    `)
    .or(
      clientIds.length > 0
        ? `coach_id.eq.${user.id},client_id.in.(${clientIds.join(',')})`
        : `coach_id.eq.${user.id}`
    )
    .order('created_at', { ascending: false })

  // Normaliser les jointures et dédoublonner par ID
  const seen = new Set<string>()
  const uniqueGoals: RaceGoalWithProfile[] = []

  for (const g of allGoals ?? []) {
    if (!seen.has(g.id)) {
      seen.add(g.id)

      // Supabase peut retourner la relation en tableau ou en objet selon le contexte
      const profile = Array.isArray(g.athlete_trail_profile)
        ? g.athlete_trail_profile[0] ?? null
        : g.athlete_trail_profile ?? null

      const client = Array.isArray(g.client)
        ? g.client[0] ?? undefined
        : g.client ?? undefined

      uniqueGoals.push({ ...g, athlete_trail_profile: profile, client })
    }
  }

  return <PreparationsList goals={uniqueGoals} />
}
