// Page de détail/édition d'un programme (ajout/suppression d'exercices)
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutDetail } from './workout-detail'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer le programme avec ses exercices
  const { data: workout } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, exercise:exercises(*))')
    .eq('id', id)
    .single()

  if (!workout) redirect('/coach/workouts')

  // Récupérer tous les exercices pour le sélecteur
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('coach_id', user.id)
    .order('name')

  return <WorkoutDetail workout={workout} exercises={exercises ?? []} />
}
