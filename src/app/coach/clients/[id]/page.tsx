// Page fiche client — Server Component qui charge les données du profil
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ClientDetail } from './client-detail'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  // Vérifier si le client a confirmé son email
  const admin = createAdminClient()
  const { data: authUser } = await admin.auth.admin.getUserById(clientId)
  const emailConfirmed = !!authUser?.user?.email_confirmed_at

  return <ClientDetail client={client} emailConfirmed={emailConfirmed} />
}
