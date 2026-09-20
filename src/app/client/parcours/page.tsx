// Page "Mon parcours" — historique des programmes terminés et programme en cours
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ParcoursView } from './parcours-view'

export default async function ParcoursPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Programme actif
  const { data: activeProgram } = await supabase
    .from('programs')
    .select(`
      id, name, status, created_at,
      weeks(
        id, week_number,
        sessions(
          id,
          session_log:session_logs(*)
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'active')
    .single()

  // Programmes terminés
  const { data: completedPrograms } = await supabase
    .from('programs')
    .select(`
      id, name, status, created_at,
      weeks(
        id, week_number,
        sessions(
          id,
          session_log:session_logs(*)
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  return (
    <ParcoursView
      activeProgram={activeProgram}
      completedPrograms={completedPrograms ?? []}
      userId={user.id}
    />
  )
}
