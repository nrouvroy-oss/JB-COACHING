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
          session_excluded_exercises(workout_exercise_id),
          session_exercise_details(workout_exercise_id, sets, reps),
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

  // Récupérer les programmes (workouts) avec leurs exercices pour les assigner aux séances
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, workout_exercises(id, order_index, coach_notes, exercise:exercises(id, name, category, video_url))')
    .order('name')

  // Récupérer les plans d'autres clients (pour copier un plan existant)
  const { data: allPrograms } = await supabase
    .from('programs')
    .select('id, name, client_id, client:profiles!client_id(full_name, first_name, last_name)')
    .not('client_id', 'is', null)
    .neq('client_id', clientId)
    .order('created_at', { ascending: false })

  // Formater la liste pour l'affichage
  const otherClientPrograms = (allPrograms ?? []).map((p: any) => {
    const c = Array.isArray(p.client) ? p.client[0] : p.client
    return {
      id: p.id,
      name: p.name,
      client_name: c ? (c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.full_name) : 'Client',
    }
  })

  return (
    <ProgramPageClient
      client={client}
      program={program}
      exercises={exercises ?? []}
      workouts={(workouts ?? []) as any}
      otherClientPrograms={otherClientPrograms}
    />
  )
}
