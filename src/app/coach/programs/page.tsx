// Page des programmes — modèles et programmes assignés à des clients
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgramsClient } from './programs-client'

export default async function ProgramsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer les modèles : programmes sans client (client_id IS NULL)
  const { data: templates } = await supabase
    .from('programs')
    .select(`
      id, name, coach_id, status, created_at,
      weeks(id, week_number, sessions(id))
    `)
    .eq('coach_id', user.id)
    .is('client_id', null)
    .order('created_at', { ascending: false })

  // Récupérer les programmes assignés à des clients avec le nom du client
  const { data: assignedPrograms } = await supabase
    .from('programs')
    .select(`
      id, name, status, created_at,
      client:profiles!client_id(id, full_name, first_name, last_name)
    `)
    .eq('coach_id', user.id)
    .not('client_id', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <ProgramsClient
      templates={templates ?? []}
      assignedPrograms={assignedPrograms ?? []}
    />
  )
}
