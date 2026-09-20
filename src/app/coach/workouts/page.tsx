// Page de gestion des programmes (blocs réutilisables d'exercices)
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutsClient } from './workouts-client'

export default async function WorkoutsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer les programmes du coach avec le nombre d'exercices
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, workout_exercises(id)')
    .eq('coach_id', user.id)
    .order('name')

  return <WorkoutsClient workouts={workouts ?? []} />
}
