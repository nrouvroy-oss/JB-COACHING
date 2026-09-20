'use server'

// Server Actions pour l'espace coach — opérations privilégiées côté serveur uniquement
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const email = formData.get('email') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string

  // Champs optionnels du profil
  const phone = (formData.get('phone') as string) || null
  const birthDate = (formData.get('birth_date') as string) || null
  const objective = (formData.get('objective') as string) || null
  const notes = (formData.get('notes') as string) || null

  // Composition du nom complet pour la compatibilité ascendante
  const fullName = `${firstName} ${lastName}`.trim()

  // Validation des champs obligatoires
  if (!email || !firstName || !lastName) {
    return { error: 'Prénom, nom et email sont obligatoires' }
  }

  // Vérifier que l'utilisateur actuel est bien coach
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') return { error: 'Non autorisé' }

  // Inviter le client par email — il recevra un lien pour choisir son mot de passe
  const admin = createAdminClient()
  const { data: newUser, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, first_name: firstName, last_name: lastName, role: 'client' },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/auth/set-password`,
  })

  if (inviteError) {
    if (inviteError.message.includes('already')) {
      return { error: 'Un compte avec cet email existe déjà' }
    }
    return { error: `Erreur: ${inviteError.message}` }
  }

  // Créer le profil directement avec tous les champs
  if (newUser?.user) {
    await admin.from('profiles').upsert({
      id: newUser.user.id,
      email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      role: 'client',
      coach_id: user.id,
      phone,
      birth_date: birthDate,
      objective,
      notes,
    })
  }

  revalidatePath('/coach')
  return {}
}
