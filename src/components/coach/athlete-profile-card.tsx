// Carte de synthèse du profil trail — affiche le questionnaire rempli par le sportif
// Utilisée dans le dossier sportif côté coach (/coach/preparations/[goalId])
import type { RaceGoalWithProfile } from '@/lib/types'

interface AthleteProfileCardProps {
  goal: RaceGoalWithProfile
}

// Dictionnaires de libellés lisibles pour les valeurs brutes
const GOAL_TYPE_LABELS: Record<string, string> = {
  finish: 'Terminer la course',
  comfortable: 'Finir confortablement',
  improve: 'Progresser par rapport à avant',
  target_time: 'Chrono cible',
  performance: 'Performance maximale',
}

const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  avance: 'Avancé',
}

const EXPERIENCE_LABELS: Record<string, string> = {
  '<1an': 'Moins d\'1 an',
  '1-2ans': '1 à 2 ans',
  '2-5ans': '2 à 5 ans',
  '5+ans': '5 ans et plus',
}

const TRAIL_EXP_LABELS: Record<string, string> = {
  jamais: 'Jamais fait de trail',
  quelques_courts: 'Quelques trails courts',
  regulierement: 'Trail régulièrement',
  experimente: 'Expérimenté',
}

const TERRAIN_LABELS: Record<string, string> = {
  roulant: 'Roulant',
  vallonne: 'Vallonné',
  montagne: 'Montagne',
  technique: 'Technique',
  tres_technique: 'Très technique',
}

const JOURS_SEMAINE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Formater une durée en minutes vers h:mm
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

// Calculer les semaines restantes avant la course
function weeksUntilRace(raceDateStr: string): number {
  const today = new Date()
  const raceDate = new Date(raceDateStr)
  const diffMs = raceDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)))
}

// Formater une date au format français
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function AthleteProfileCard({ goal }: AthleteProfileCardProps) {
  const profile = goal.athlete_trail_profile
  const weeksLeft = weeksUntilRace(goal.race_date)

  return (
    <div className="space-y-3">

      {/* Section Course */}
      <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#242424]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            {/* Icône drapeau */}
            <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            Course
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <p className="text-xs text-[#666] uppercase tracking-wide">Nom</p>
            <p className="text-sm font-bold text-white mt-0.5">{goal.race_name}</p>
          </div>
          <div>
            <p className="text-xs text-[#666] uppercase tracking-wide">Date</p>
            <p className="text-sm text-white mt-0.5">{formatDate(goal.race_date)}</p>
          </div>
          <div>
            <p className="text-xs text-[#666] uppercase tracking-wide">Semaines restantes</p>
            <p className="text-sm font-bold text-[#d4ff00] mt-0.5">{weeksLeft} sem.</p>
          </div>
          <div>
            <p className="text-xs text-[#666] uppercase tracking-wide">Distance</p>
            <p className="text-sm text-white mt-0.5">{goal.distance_km} km</p>
          </div>
          <div>
            <p className="text-xs text-[#666] uppercase tracking-wide">Dénivelé +</p>
            <p className="text-sm text-white mt-0.5">{goal.elevation_gain_m.toLocaleString('fr-FR')} m</p>
          </div>
          {goal.elevation_loss_m != null && (
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide">Dénivelé −</p>
              <p className="text-sm text-white mt-0.5">{goal.elevation_loss_m.toLocaleString('fr-FR')} m</p>
            </div>
          )}
          {goal.terrain_type && (
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide">Terrain</p>
              <p className="text-sm text-white mt-0.5">{TERRAIN_LABELS[goal.terrain_type] ?? goal.terrain_type}</p>
            </div>
          )}
          {goal.max_altitude_m != null && (
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide">Altitude max</p>
              <p className="text-sm text-white mt-0.5">{goal.max_altitude_m.toLocaleString('fr-FR')} m</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Objectif */}
      <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#242424]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            {/* Icône cible */}
            <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            Objectif
          </h3>
        </div>
        <div className="p-4 space-y-2">
          <div>
            <p className="text-xs text-[#666] uppercase tracking-wide">Type d'objectif</p>
            <p className="text-sm font-bold text-[#d4ff00] mt-0.5">{GOAL_TYPE_LABELS[goal.goal_type] ?? goal.goal_type}</p>
          </div>
          {goal.target_time_minutes != null && (
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide">Chrono cible</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatDuration(goal.target_time_minutes)}</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Niveau — uniquement si le profil existe */}
      {profile && (
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {/* Icône étoile */}
              <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Niveau
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {profile.declared_level && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Niveau déclaré</p>
                <p className="text-sm font-bold text-white mt-0.5">{LEVEL_LABELS[profile.declared_level] ?? profile.declared_level}</p>
              </div>
            )}
            {profile.running_experience && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Course à pied</p>
                <p className="text-sm text-white mt-0.5">{EXPERIENCE_LABELS[profile.running_experience] ?? profile.running_experience}</p>
              </div>
            )}
            {profile.trail_experience && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Expérience trail</p>
                <p className="text-sm text-white mt-0.5">{TRAIL_EXP_LABELS[profile.trail_experience] ?? profile.trail_experience}</p>
              </div>
            )}
            {profile.longest_trail_km != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Plus long trail</p>
                <p className="text-sm text-white mt-0.5">
                  {profile.longest_trail_km} km
                  {profile.longest_trail_elevation_m != null && ` / ${profile.longest_trail_elevation_m.toLocaleString('fr-FR')} m D+`}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section Entraînement actuel */}
      {profile && (
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {/* Icône graphe */}
              <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Entraînement actuel
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {profile.sessions_per_week != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Séances / sem.</p>
                <p className="text-sm font-bold text-white mt-0.5">{profile.sessions_per_week}</p>
              </div>
            )}
            {profile.weekly_distance_km != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Distance / sem.</p>
                <p className="text-sm font-bold text-white mt-0.5">{profile.weekly_distance_km} km</p>
              </div>
            )}
            {profile.weekly_duration_minutes != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Durée / sem.</p>
                <p className="text-sm font-bold text-white mt-0.5">{formatDuration(profile.weekly_duration_minutes)}</p>
              </div>
            )}
            {profile.weekly_elevation_gain_m != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">D+ / sem.</p>
                <p className="text-sm font-bold text-white mt-0.5">{profile.weekly_elevation_gain_m.toLocaleString('fr-FR')} m</p>
              </div>
            )}
            {profile.longest_run_km != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">Sortie longue</p>
                <p className="text-sm text-white mt-0.5">
                  {profile.longest_run_km} km
                  {profile.longest_run_minutes != null && ` · ${formatDuration(profile.longest_run_minutes)}`}
                </p>
              </div>
            )}
            {profile.longest_run_elevation_m != null && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide">D+ sortie longue</p>
                <p className="text-sm text-white mt-0.5">{profile.longest_run_elevation_m.toLocaleString('fr-FR')} m</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section Disponibilités */}
      {profile?.availability && (
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {/* Icône calendrier */}
              <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Disponibilités
            </h3>
          </div>
          <div className="p-4">
            {/* Grille 7 jours */}
            <div className="flex gap-1.5 mb-3">
              {JOURS_SEMAINE.map((jour, i) => {
                const dayData = profile.availability?.[jour]
                const isAvailable = dayData?.available === true
                return (
                  <div key={jour} className="flex-1 text-center">
                    <p className="text-xs text-[#666] mb-1">{JOURS_COURTS[i]}</p>
                    <div className={`rounded-lg py-2 min-h-[36px] flex flex-col items-center justify-center ${isAvailable ? 'bg-[#d4ff00]/15 border border-[#d4ff00]/30' : 'bg-[#141414] border border-[#2a2a2a]'}`}>
                      {isAvailable ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d4ff00]" />
                          {dayData?.max_minutes != null && (
                            <p className="text-[10px] text-[#d4ff00] font-medium mt-0.5 leading-none">
                              {formatDuration(dayData.max_minutes)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Jour préféré sortie longue */}
            {profile.preferred_long_run_day && (
              <p className="text-xs text-[#888]">
                Sortie longue préférée le{' '}
                <span className="font-bold text-white capitalize">{profile.preferred_long_run_day}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Section Terrain & Contraintes */}
      {profile && (profile.terrain_access || profile.has_strength_access || profile.constraints_notes) && (
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {/* Icône montagne */}
              <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
              Terrain & Contraintes
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {/* Accès terrain */}
            {profile.terrain_access && profile.terrain_access.length > 0 && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide mb-1.5">Terrains accessibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.terrain_access.map((t) => (
                    <span key={t} className="text-xs bg-[#242424] border border-[#333] text-[#ccc] rounded-md px-2 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Renfo */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${profile.has_strength_access ? 'bg-[#d4ff00]' : 'bg-[#444]'}`} />
              <p className="text-sm text-[#888]">
                Renforcement musculaire :{' '}
                <span className={`font-medium ${profile.has_strength_access ? 'text-white' : 'text-[#555]'}`}>
                  {profile.has_strength_access
                    ? profile.strength_location
                      ? `Oui (${profile.strength_location})`
                      : 'Oui'
                    : 'Non'}
                </span>
              </p>
            </div>
            {/* Contraintes */}
            {profile.constraints_notes && (
              <div>
                <p className="text-xs text-[#666] uppercase tracking-wide mb-1">Contraintes / notes</p>
                <p className="text-sm text-[#ccc] leading-relaxed bg-[#141414] rounded-lg p-3">
                  {profile.constraints_notes}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Message si le profil est absent */}
      {!profile && (
        <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-6 text-center">
          <p className="text-sm text-[#666]">Le sportif n&apos;a pas encore rempli le questionnaire.</p>
        </div>
      )}
    </div>
  )
}
