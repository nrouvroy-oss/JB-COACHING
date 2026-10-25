// Page principale de l'espace client — charge le programme actif du client
import { createServerClient } from '@/lib/supabase/server'
import { ClientProgramView } from './program-view'

export default async function ClientProgramPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer le prénom du client
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, full_name')
    .eq('id', user.id)
    .single()

  // Utilise first_name en priorité, repli sur le premier mot de full_name pour les anciens comptes
  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? ''

  // Récupérer le programme actif avec toutes les relations imbriquées
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      weeks(
        *,
        sessions(
          *,
          workout:workouts(id, name),
          session_log:session_logs(*),
          session_exercises(
            *,
            exercise:exercises(*),
            exercise_log:exercise_logs(*)
          )
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'active')
    .single()

  if (!program) {
    return (
      <div className="text-center py-12">
        {/* Image motivationnelle quand aucun programme n'est actif */}
        <div className="relative h-40 rounded-2xl overflow-hidden mb-4 mx-auto">
          <img
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative h-full flex items-center justify-center px-4">
            <p className="text-white font-semibold text-center">Ton coach te prépare un plan</p>
          </div>
        </div>
        <p className="text-[#888]">Aucun plan pour le moment.</p>
        <p className="text-sm text-[#777] mt-2">Ton coach te préparera bientôt un plan !</p>
      </div>
    )
  }

  return <ClientProgramView program={program} firstName={firstName} />
}
