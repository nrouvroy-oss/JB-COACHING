// Page création objectif course — wizard 7 étapes
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WizardForm } from './wizard-form'

export default async function NewGoalPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier qu’il n’a pas déjà un objectif actif
  const { data: existing } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .limit(1)

  if (existing && existing.length > 0) {
    redirect(`/client/goal/${existing[0].id}`)
  }

  return <WizardForm />
}
