// Page dossier sportif — Server Component qui charge toutes les données nécessaires
import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PreparationDetail } from './preparation-detail'
import type { RaceGoalWithProfile, Program, SessionFeedback } from '@/lib/types'

export default async function PreparationDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params

  // Vérifier que l'utilisateur est bien un coach
  const user = await requireCoach()
  if (!user) redirect('/login')

  const supabase = await createServerClient()

  // Charger le race_goal avec le profil trail et le profil client
  const { data: goalData } = await supabase
    .from('race_goals')
    .select(`
      *,
      athlete_trail_profile:athlete_trail_profiles(*),
      client:profiles!race_goals_client_id_fkey(*)
    `)
    .eq('id', goalId)
    .single()

  // Rediriger si l'objectif n'existe pas
  if (!goalData) redirect('/coach/preparations')

  const goal = goalData as unknown as RaceGoalWithProfile

  // Charger le programme lié à cet objectif s'il existe
  const { data: programData } = await supabase
    .from('programs')
    .select('*')
    .eq('race_goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const program: Program | null = programData ?? null

  // Charger les feedbacks des séances du programme si un programme existe
  let feedbacks: (SessionFeedback & { session_name?: string })[] = []

  if (program) {
    // Récupérer toutes les semaines du programme
    const { data: weeks } = await supabase
      .from('weeks')
      .select('id')
      .eq('program_id', program.id)

    if (weeks && weeks.length > 0) {
      const weekIds = weeks.map((w) => w.id)

      // Récupérer toutes les séances des semaines
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, name')
        .in('week_id', weekIds)

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s) => s.id)
        const sessionNameMap = Object.fromEntries(sessions.map((s) => [s.id, s.name]))

        // Récupérer les feedbacks pour ces séances
        const { data: feedbackData } = await supabase
          .from('session_feedbacks')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: false })

        if (feedbackData) {
          // Enrichir chaque feedback avec le nom de la séance
          feedbacks = feedbackData.map((fb) => ({
            ...fb,
            session_name: sessionNameMap[fb.session_id] ?? 'Séance',
          }))
        }
      }
    }
  }

  return (
    <PreparationDetail
      goal={goal}
      program={program}
      feedbacks={feedbacks}
    />
  )
}
