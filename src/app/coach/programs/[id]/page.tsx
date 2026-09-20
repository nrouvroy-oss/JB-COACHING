// Page d'édition d'un modèle de programme — récupère les données côté serveur
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplateEditor } from '@/components/coach/template-editor'

export default async function TemplateProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer le modèle avec toutes les semaines, séances et exercices imbriqués
  const { data: program } = await supabase
    .from('programs')
    .select(`
      id, name, coach_id, status, created_at,
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
    .eq('id', programId)
    .eq('coach_id', user.id)
    .is('client_id', null)
    .single()

  // Rediriger si le programme n'existe pas ou appartient à un client
  if (!program) redirect('/coach/programs')

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

  return (
    <TemplateEditor
      program={program as any}
      exercises={exercises ?? []}
      workouts={(workouts ?? []) as any}
    />
  )
}
