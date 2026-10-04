// Page de redirection — objectif course du sportif
// Redirige vers l'objectif actif ou vers la page de création
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GoalRedirect() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Chercher un objectif actif (draft, pending ou active)
  const { data: goal } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Rediriger vers l'objectif existant ou vers la création
  if (goal) redirect(`/client/goal/${goal.id}`)
  redirect('/client/goal/new')
}
