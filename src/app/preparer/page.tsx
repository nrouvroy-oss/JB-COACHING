// Page création objectif course — accessible sans auth
// Si connecté et objectif existant → redirige. Sinon → wizard.
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WizardForm } from './wizard-form'

export default async function NewGoalPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si connecté, vérifier s'il a déjà un objectif actif
  if (user) {
    const { data: existing } = await supabase
      .from('race_goals')
      .select('id')
      .eq('client_id', user.id)
      .in('status', ['draft', 'pending', 'active'])
      .limit(1)

    if (existing && existing.length > 0) {
      redirect(`/client/goal/${existing[0].id}`)
    }
  }

  // isLoggedIn indique au wizard s'il doit afficher le formulaire d'inscription
  return <WizardForm isLoggedIn={!!user} />
}
