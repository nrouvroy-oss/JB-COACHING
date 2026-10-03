// Page bibliothèque d'exercices — récupère exercices standard + exercices du coach
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { ExercisesPageClient } from './exercises-client'

export default async function ExercisesPage() {
  const user = await requireCoach()
  const supabase = await createServerClient()

  // Récupérer les exercices standard (coach_id IS NULL) + les exercices du coach
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .or(`coach_id.is.null,coach_id.eq.${user!.id}`)
    .order('category')
    .order('name')

  // Récupérer les programmes (workouts) avec les IDs d'exercices associés
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, workout_exercises(exercise_id)')
    .order('name')

  return <ExercisesPageClient exercises={exercises ?? []} workouts={workouts ?? []} />
}
