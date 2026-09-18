'use server'

// Server Actions pour l'espace coach — opérations privilégiées côté serveur uniquement
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const password = formData.get('password') as string

  // Validation des champs obligatoires
  if (!email || !fullName || !password) {
    return { error: 'Tous les champs sont obligatoires' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit faire au moins 6 caractères' }
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

  // Créer le compte client via l'API admin (email confirmé automatiquement)
  const admin = createAdminClient()
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'client' },
  })

  if (createError) {
    if (createError.message.includes('already')) {
      return { error: 'Un compte avec cet email existe déjà' }
    }
    return { error: 'Erreur lors de la création du compte' }
  }

  // Invalider le cache de la page coach pour recharger la liste des clients
  revalidatePath('/coach')
  return {}
}
