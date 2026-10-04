'use client'

// Vue objectif course du sportif — statut, résumé course, profil, semaines restantes
import Link from 'next/link'
import type { RaceGoalWithProfile } from '@/lib/types'

interface Props {
  goal: RaceGoalWithProfile
  programId: string | null
}

// Libellés lisibles pour le type d'objectif
const GOAL_TYPE_LABELS: Record<string, string> = {
  finish: 'Terminer la course',
  comfortable: 'Finir confortablement',
  improve: 'Améliorer mon temps',
  target_time: 'Chrono cible',
  performance: 'Performance maximale',
}

// Libellés lisibles pour le type de terrain
const TERRAIN_LABELS: Record<string, string> = {
  roulant: 'Roulant',
  vallonne: 'Vallonné',
  montagne: 'Montagne',
  technique: 'Technique',
  tres_technique: 'Très technique',
}

// Libellés pour le niveau déclaré
const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  avance: 'Avancé',
}

// Convertir des minutes en format lisible "Xh Ymin"
function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  if (h === 0) return `${min} min`
  if (min === 0) return `${h}h`
  return `${h}h ${min}min`
}

// Calculer le nombre de semaines restantes avant la course
function weeksUntilRace(raceDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const raceDate = new Date(raceDateStr)
  raceDate.setHours(0, 0, 0, 0)
  const diffMs = raceDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)))
}

// Formater une date en français
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Badge de statut coloré
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: 'Brouillon', classes: 'bg-[#2a2a2a] text-[#888]' },
    pending: { label: 'En attente', classes: 'bg-amber-900/40 text-amber-400 border border-amber-800/50' },
    active: { label: 'En cours', classes: 'bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30' },
    completed: { label: 'Terminé', classes: 'bg-[#2a2a2a] text-[#666]' },
  }[status] ?? { label: status, classes: 'bg-[#2a2a2a] text-[#888]' }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}

export function GoalView({ goal, programId }: Props) {
  const weeksLeft = weeksUntilRace(goal.race_date)
  const profile = goal.athlete_trail_profile

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* En-tête — nom de la course + badge statut */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1
            className="text-2xl font-extrabold text-white leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {goal.race_name}
          </h1>
          <StatusBadge status={goal.status} />
        </div>
        <p className="text-[#888] text-sm">{formatDate(goal.race_date)}</p>
      </div>

      {/* Carte résumé course */}
      <div className="mx-4 mb-4 bg-[#1c1c1c] rounded-2xl p-4 border border-[#2a2a2a]">
        <h2
          className="text-xs font-bold text-[#d4ff00] uppercase tracking-widest mb-3"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          La course
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Distance */}
          <div className="bg-[#242424] rounded-xl p-3">
            <p className="text-[#666] text-xs mb-1">Distance</p>
            <p className="text-white font-bold text-lg">{goal.distance_km} km</p>
          </div>

          {/* Dénivelé */}
          <div className="bg-[#242424] rounded-xl p-3">
            <p className="text-[#666] text-xs mb-1">Dénivelé +</p>
            <p className="text-white font-bold text-lg">{goal.elevation_gain_m} m</p>
          </div>

          {/* Terrain */}
          {goal.terrain_type && (
            <div className="bg-[#242424] rounded-xl p-3">
              <p className="text-[#666] text-xs mb-1">Terrain</p>
              <p className="text-white font-semibold text-sm">
                {TERRAIN_LABELS[goal.terrain_type] ?? goal.terrain_type}
              </p>
            </div>
          )}

          {/* Semaines restantes */}
          <div className="bg-[#242424] rounded-xl p-3">
            <p className="text-[#666] text-xs mb-1">Semaines restantes</p>
            <p className={`font-bold text-lg ${weeksLeft <= 4 ? 'text-amber-400' : 'text-[#d4ff00]'}`}>
              {weeksLeft}
            </p>
          </div>
        </div>

        {/* Objectif */}
        <div className="mt-3 bg-[#242424] rounded-xl p-3">
          <p className="text-[#666] text-xs mb-1">Objectif</p>
          <p className="text-white font-semibold text-sm">
            {GOAL_TYPE_LABELS[goal.goal_type] ?? goal.goal_type}
            {goal.target_time_minutes && (
              <span className="text-[#d4ff00] ml-2">— {formatMinutes(goal.target_time_minutes)}</span>
            )}
          </p>
        </div>
      </div>

      {/* Message selon le statut */}
      {goal.status === 'pending' && (
        <div className="mx-4 mb-4 bg-amber-900/20 border border-amber-800/40 rounded-2xl p-4">
          {/* Icône horloge */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Plan en préparation</p>
              <p className="text-amber-400/80 text-sm leading-relaxed">
                Ton coach analyse ton dossier et prépare ton plan. Tu seras notifié quand il sera prêt.
              </p>
            </div>
          </div>
        </div>
      )}

      {goal.status === 'active' && programId && (
        <div className="mx-4 mb-4">
          <Link
            href="/client"
            className="flex items-center justify-between bg-[#d4ff00] text-[#0a0a0a] rounded-2xl p-4 min-h-[44px] font-bold text-sm active:opacity-90 transition-opacity"
          >
            <span>Voir mon plan d'entraînement</span>
            {/* Flèche droite */}
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      )}

      {goal.status === 'active' && !programId && (
        <div className="mx-4 mb-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4">
          <p className="text-[#888] text-sm text-center">
            Ton plan est actif — consulte l'onglet <span className="text-white font-semibold">Mon plan</span>.
          </p>
        </div>
      )}

      {/* Carte profil trail (si rempli) */}
      {profile && (
        <div className="mx-4 mb-4 bg-[#1c1c1c] rounded-2xl p-4 border border-[#2a2a2a]">
          <h2
            className="text-xs font-bold text-[#d4ff00] uppercase tracking-widest mb-3"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Mon profil
          </h2>

          <div className="space-y-2">
            {/* Niveau */}
            {profile.declared_level && (
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#888] text-sm">Niveau déclaré</span>
                <span className="text-white text-sm font-medium">
                  {LEVEL_LABELS[profile.declared_level] ?? profile.declared_level}
                </span>
              </div>
            )}

            {/* Volume hebdomadaire */}
            {(profile.weekly_distance_km || profile.weekly_duration_minutes) && (
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#888] text-sm">Volume hebdo</span>
                <span className="text-white text-sm font-medium">
                  {profile.weekly_distance_km && `${profile.weekly_distance_km} km`}
                  {profile.weekly_distance_km && profile.weekly_duration_minutes && ' · '}
                  {profile.weekly_duration_minutes && formatMinutes(profile.weekly_duration_minutes)}
                </span>
              </div>
            )}

            {/* Séances par semaine */}
            {profile.sessions_per_week && (
              <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                <span className="text-[#888] text-sm">Séances / semaine</span>
                <span className="text-white text-sm font-medium">{profile.sessions_per_week}</span>
              </div>
            )}

            {/* Disponibilités */}
            {profile.availability && (
              <div className="py-2 border-b border-[#2a2a2a]">
                <p className="text-[#888] text-sm mb-2">Disponibilités</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(profile.availability)
                    .filter(([, v]) => v.available)
                    .map(([day]) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 bg-[#d4ff00]/10 text-[#d4ff00] rounded-full text-xs font-medium capitalize"
                      >
                        {day}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Contraintes */}
            {profile.constraints_notes && (
              <div className="py-2">
                <p className="text-[#888] text-sm mb-1">Contraintes / notes</p>
                <p className="text-white text-sm leading-relaxed">{profile.constraints_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pied de page — date de création */}
      <p className="text-center text-[#555] text-xs mt-2 px-4">
        Objectif créé le {formatDate(goal.created_at)}
      </p>
    </div>
  )
}
