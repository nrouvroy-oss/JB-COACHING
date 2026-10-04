// Page cr\u00e9ation objectif course \u2014 wizard 7 \u00e9tapes
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WizardForm } from './wizard-form'

export default async function NewGoalPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // V\u00e9rifier qu\u2019il n\u2019a pas d\u00e9j\u00e0 un objectif actif
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
