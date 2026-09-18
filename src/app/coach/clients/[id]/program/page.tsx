// Page du programme d'un client spécifique — récupère les données côté serveur
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgramPageClient } from './program-client'

export default async function ClientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  // Récupérer le profil du client
  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  // Récupérer le programme actif avec toutes les relations imbriquées
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      client:profiles!client_id(*),
      weeks(
        *,
        sessions(
          *,
          session_exercises(
            *,
            exercise:exercises(*)
          )
        )
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  // Récupérer tous les exercices pour le picker
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  return (
    <ProgramPageClient
      client={client}
      program={program}
      exercises={exercises ?? []}
    />
  )
}
