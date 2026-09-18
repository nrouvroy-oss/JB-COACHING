// Page bibliothèque d'exercices — récupère les données côté serveur
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

  return <ExercisesPageClient exercises={exercises ?? []} />
}
