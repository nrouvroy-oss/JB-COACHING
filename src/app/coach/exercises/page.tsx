// Page bibliothèque d'exercices — récupère exercices + programmes associés
import { createServerClient } from '@/lib/supabase/server'
import { ExercisesPageClient } from './exercises-client'

export default async function ExercisesPage() {
  const supabase = await createServerClient()

  // Récupérer tous les exercices triés par catégorie puis par nom
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('category')
    .order('name')

  // Récupérer les programmes (workouts) avec les IDs d'exercices associés
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, workout_exercises(exercise_id)')
    .order('name')

  return <ExercisesPageClient exercises={exercises ?? []} workouts={workouts ?? []} />
}
