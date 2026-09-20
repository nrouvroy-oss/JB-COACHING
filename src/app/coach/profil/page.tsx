// Page profil coach — permet de modifier son prénom, nom, etc.
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoachProfileForm } from './profil-form'

export default async function CoachProfilPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/coach')

  return <CoachProfileForm profile={profile} />
}
