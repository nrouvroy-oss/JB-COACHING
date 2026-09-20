'use server'

// Action serveur pour mettre à jour le profil du coach
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateCoachProfile(data: {
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
}) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath('/coach')
  return {}
}
