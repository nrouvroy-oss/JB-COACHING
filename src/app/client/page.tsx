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

  // Vérifier si c'est la première connexion (aucun session_log)
  const { count: sessionLogCount } = await supabase
    .from('session_logs')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', user.id)

  const isFirstVisit = (sessionLogCount ?? 0) === 0 && !program

  if (!program) {
    return (
      <div className="py-8">
        {/* Message de bienvenue à la première connexion */}
        {isFirstVisit && (
          <div className="mb-6">
            <h1
              className="text-2xl font-extrabold text-white mb-2"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Bienvenue {firstName} !
            </h1>
            <p className="text-[#888] text-sm mb-6">Ton espace entraînement est prêt.</p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ton plan arrive bientôt</p>
                  <p className="text-xs text-[#888] mt-0.5">Ton coach prépare ton programme personnalisé</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Lance tes séances avec Go</p>
                  <p className="text-xs text-[#888] mt-0.5">Vidéos en boucle, chrono intégré, tout est guidé</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Donne ton feedback</p>
                  <p className="text-xs text-[#888] mt-0.5">Après chaque séance, ton coach suit ta progression</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* État vide quand pas de programme */}
        {!isFirstVisit && (
          <div className="text-center py-12">
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
        )}
      </div>
    )
  }

  return <ClientProgramView program={program} firstName={firstName} />
}
