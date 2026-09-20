// Page fiche client — Server Component qui charge les données du profil
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientDetail } from './client-detail'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  // Charger le profil complet du client
  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  // Rediriger si le client n'existe pas
  if (!client) redirect('/coach')

  return <ClientDetail client={client} />
}
