'use server'

// Actions serveur pour la fiche client — mise à jour du profil
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateClientProfile(clientId: string, data: {
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string | null
  birth_date?: string | null
  gender?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  objective?: string | null
  notes?: string | null
}) {
  // Vérifier que l'utilisateur est connecté et est coach
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  // Utiliser le client admin pour contourner le RLS (le coach modifie le profil d'un autre utilisateur)
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update(data)
    .eq('id', clientId)

  if (error) return { error: 'Erreur lors de la mise à jour' }

  // Invalider le cache pour recharger les données fraîches
  revalidatePath(`/coach/clients/${clientId}`)
  return {}
}

// Supprime un client et toutes ses données (profil, programmes, logs, compte auth)
export async function deleteClient(clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const admin = createAdminClient()

  // Supprimer le profil (cascade supprime programmes, semaines, séances, logs...)
  await admin.from('profiles').delete().eq('id', clientId)

  // Supprimer le compte auth
  await admin.auth.admin.deleteUser(clientId)

  revalidatePath('/coach/clients')
  return {}
}
