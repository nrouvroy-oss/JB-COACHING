'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Marquer un exercice comme complété ou non
export async function toggleExercise(sessionExerciseId: string, clientId: string, completed: boolean) {
  const supabase = await createServerClient()

  // Vérifier que c'est bien le bon client
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== clientId) return { error: 'Non autorisé' }

  // Upsert le log (créer ou mettre à jour)
  const { error } = await supabase
    .from('exercise_logs')
    .upsert(
      {
        session_exercise_id: sessionExerciseId,
        client_id: clientId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'session_exercise_id,client_id' }
    )

  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath('/client')
  return {}
}

// Enregistrer le commentaire d'un client sur un exercice
export async function submitFeedback(sessionExerciseId: string, clientId: string, feedback: string) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== clientId) return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('exercise_logs')
    .upsert(
      {
        session_exercise_id: sessionExerciseId,
        client_id: clientId,
        feedback,
      },
      { onConflict: 'session_exercise_id,client_id' }
    )

  if (error) return { error: 'Erreur lors de l\'envoi' }
  revalidatePath('/client')
  return {}
}
