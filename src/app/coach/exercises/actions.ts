'use server'

// Server Actions pour les exercices — suppression et duplication
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function deleteExercise(id: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Vérifier que ce n'est pas un exercice standard (coach_id = NULL)
  const { data: exercise } = await supabase
    .from('exercises')
    .select('coach_id')
    .eq('id', id)
    .single()

  if (!exercise) return { error: 'Exercice introuvable' }
  if (exercise.coach_id === null) return { error: 'Impossible de supprimer un exercice standard' }

  const { error } = await supabase.from('exercises').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/coach/exercises')
  return {}
}

// Duplique un exercice standard dans la bibliothèque personnelle du coach
export async function duplicateExercise(exerciseId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Récupérer l'exercice source
  const { data: source } = await supabase
    .from('exercises')
    .select('name, description, video_url, category')
    .eq('id', exerciseId)
    .single()

  if (!source) return { error: 'Exercice introuvable' }

  // Créer la copie avec le coach_id du coach connecté
  const { error } = await supabase.from('exercises').insert({
    name: `${source.name} (copie)`,
    description: source.description,
    video_url: source.video_url,
    category: source.category,
    coach_id: user.id,
  })

  if (error) return { error: 'Erreur lors de la duplication' }

  revalidatePath('/coach/exercises')
  return {}
}
