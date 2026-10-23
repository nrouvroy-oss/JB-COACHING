'use server'

// Action serveur pour finaliser l'inscription coach — crée le profil si le trigger DB ne l'a pas fait
import { createAdminClient } from '@/lib/supabase/admin'

export async function ensureCoachProfile(userId: string, email: string, fullName: string) {
  const admin = createAdminClient()

  // Vérifier si le profil existe déjà (créé par le trigger)
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) return { ok: true }

  // Créer le profil manuellement si le trigger n'a pas fonctionné
  const { error } = await admin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'coach',
    })

  if (error) return { error: 'Erreur lors de la création du profil : ' + error.message }

  return { ok: true }
}
