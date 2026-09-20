'use server'

// Actions serveur pour la gestion des modèles de programmes (sans client assigné)
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Crée un modèle de programme sans client associé
export async function createTemplate(name: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('programs')
    .insert({ name, client_id: null, coach_id: user.id })

  if (error) return { error: 'Erreur lors de la création du modèle' }
  revalidatePath('/coach/programs')
  return {}
}

// Renomme un modèle de programme
export async function renameTemplate(programId: string, newName: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('programs')
    .update({ name: newName })
    .eq('id', programId)
    .eq('coach_id', user.id)

  if (error) return { error: 'Erreur lors du renommage' }
  revalidatePath('/coach/programs')
  return {}
}

// Supprime un modèle de programme (uniquement si client_id est null pour éviter les suppressions accidentelles)
export async function deleteTemplate(programId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  // Vérifier que c'est bien un modèle (sans client) appartenant au coach connecté
  const { data: program } = await supabase
    .from('programs')
    .select('id, client_id, coach_id')
    .eq('id', programId)
    .single()

  if (!program) return { error: 'Programme introuvable' }
  if (program.client_id !== null) return { error: 'Ce programme est assigné à un client' }
  if (program.coach_id !== user.id) return { error: 'Accès non autorisé' }

  const { error } = await supabase.from('programs').delete().eq('id', programId)
  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/coach/programs')
  return {}
}
