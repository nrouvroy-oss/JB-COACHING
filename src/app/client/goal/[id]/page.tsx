// Page objectif course — charge le race_goal avec le profil trail et affiche la vue
import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GoalView } from './goal-view'
import type { RaceGoalWithProfile } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GoalPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()

  // Vérifier la session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer l'objectif avec son profil trail joint
  const { data: goal, error } = await supabase
    .from('race_goals')
    .select(`
      *,
      athlete_trail_profile:athlete_trail_profiles(*)
    `)
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (error || !goal) notFound()

  // Récupérer le programme lié s'il existe (pour le lien vers le plan)
  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('race_goal_id', id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const goalWithProfile = goal as RaceGoalWithProfile

  return (
    <GoalView
      goal={goalWithProfile}
      programId={program?.id ?? null}
    />
  )
}
