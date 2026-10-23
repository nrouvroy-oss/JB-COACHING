'use server'

// Action serveur pour finaliser l'inscription coach — crée le profil si le trigger DB ne l'a pas fait
// Sécurité : vérifie la session au lieu d'accepter un userId en paramètre
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'

export async function ensureCoachProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Vérifier que le rôle demandé est bien coach (dans les métadonnées du signup)
  if (user.user_metadata?.role !== 'coach') return { error: 'Rôle invalide' }

  const admin = createAdminClient()

  // Vérifier si le profil existe déjà (créé par le trigger)
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existing) return { ok: true }

  // Créer le profil manuellement si le trigger n'a pas fonctionné
  const { error } = await admin
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || '',
      role: 'coach',
    })

  if (error) return { error: 'Erreur lors de la création du profil : ' + error.message }

  return { ok: true }
}
