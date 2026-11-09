'use server'

// Actions serveur pour la fiche client — mise à jour du profil
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateClientProfile(clientId: string, data: {
  email?: string
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
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const admin = createAdminClient()

  // Si l'email change, mettre à jour aussi dans Supabase Auth
  if (data.email) {
    const { error: authError } = await admin.auth.admin.updateUserById(clientId, {
      email: data.email,
      user_metadata: { full_name: data.full_name, first_name: data.first_name, last_name: data.last_name },
    })
    if (authError) return { error: `Erreur email: ${authError.message}` }
  }

  const { error } = await admin
    .from('profiles')
    .update(data)
    .eq('id', clientId)

  if (error) return { error: 'Erreur lors de la mise à jour' }

  revalidatePath(`/coach/clients/${clientId}`)
  return {}
}

// Renvoie l'email d'invitation à un client
export async function resendInvitation(clientId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const admin = createAdminClient()

  const { data: client } = await admin.from('profiles').select('email, full_name, first_name, last_name').eq('id', clientId).single()
  if (!client) return { error: 'Client introuvable' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

  const { error } = await admin.auth.admin.inviteUserByEmail(client.email, {
    data: { full_name: client.full_name, first_name: client.first_name, last_name: client.last_name, role: 'client' },
    redirectTo: `${appUrl}/auth/callback?type=invite`,
  })

  if (error) {
    if (error.message.includes('already')) {
      const supabase = createAdminClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(client.email, {
        redirectTo: `${appUrl}/auth/callback?type=reset`,
      })
      if (resetError) return { error: `Erreur: ${resetError.message}` }
      return { info: 'Un lien pour choisir le mot de passe a été envoyé' }
    }
    return { error: `Erreur: ${error.message}` }
  }

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
