'use client'

// Liste des préparations course côté coach — cartes avec avatar, course, semaines, volume, statut
import Link from 'next/link'
import type { RaceGoalWithProfile } from '@/lib/types'

interface PreparationsListProps {
  goals: RaceGoalWithProfile[]
}

// ── Utilitaires ────────────────────────────────────────────────────────────────

/** Retourne les initiales à partir du profil client */
function getInitials(goal: RaceGoalWithProfile): string {
  const client = goal.client
  if (!client) return '?'
  if (client.first_name && client.last_name) {
    return `${client.first_name[0]}${client.last_name[0]}`.toUpperCase()
  }
  return (client.full_name?.[0] ?? '?').toUpperCase()
}

/** Retourne le nom complet du sportif */
function getClientName(goal: RaceGoalWithProfile): string {
  const client = goal.client
  if (!client) return 'Sportif inconnu'
  if (client.first_name && client.last_name) {
    return `${client.first_name} ${client.last_name}`
  }
  return client.full_name ?? 'Sportif inconnu'
}

/** Calcule le nombre de semaines restantes avant la course */
function weeksRemaining(raceDateStr: string): number {
  const now = new Date()
  const raceDate = new Date(raceDateStr)
  const diffMs = raceDate.getTime() - now.getTime()
  const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7))
  return Math.max(0, diffWeeks)
}

/** Retourne la configuration visuelle du badge de statut */
function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'pending':
      return {
        label: 'À préparer',
        className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      }
    case 'active':
      return {
        label: 'En cours',
        className: 'bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30',
      }
    case 'completed':
      return {
        label: 'Terminé',
        className: 'bg-[#333]/60 text-[#666] border border-[#333]',
      }
    default:
      return {
        label: 'Brouillon',
        className: 'bg-[#333]/60 text-[#555] border border-[#333]',
      }
  }
}

// ── Carte préparation ──────────────────────────────────────────────────────────

interface PreparationCardProps {
  goal: RaceGoalWithProfile
}

function PreparationCard({ goal }: PreparationCardProps) {
  const initials = getInitials(goal)
  const name = getClientName(goal)
  const weeks = weeksRemaining(goal.race_date)
  const badge = getStatusBadge(goal.status)
  const profile = goal.athlete_trail_profile

  return (
    <Link
      href={`/coach/preparations/${goal.id}`}
      className="block bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#333] transition-all duration-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar initiales du sportif */}
          <div className="w-11 h-11 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
            <span className="text-[#d4ff00] font-bold text-sm">{initials}</span>
          </div>

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            {/* Nom du sportif + badge statut */}
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-white text-sm truncate">{name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            {/* Nom de la course */}
            <p className="text-sm text-[#d4ff00] font-semibold mt-0.5 truncate">
              {goal.race_name}
            </p>

            {/* Distance + D+ */}
            <p className="text-xs text-[#888] mt-0.5">
              {goal.distance_km} km
              {goal.elevation_gain_m > 0 && (
                <> · D+ {goal.elevation_gain_m.toLocaleString('fr-FR')} m</>
              )}
            </p>
          </div>
        </div>

        {/* Ligne secondaire : semaines restantes + volume actuel */}
        <div className="mt-3 flex items-center justify-between gap-4">
          {/* Semaines restantes */}
          <div className="flex items-center gap-1.5">
            {/* Icône calendrier SVG */}
            <svg className="w-3.5 h-3.5 text-[#555] shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="3" width="12" height="11" rx="1.5" />
              <path d="M5 1v3M11 1v3M2 7h12" strokeLinecap="round" />
            </svg>
            <span className="text-xs text-[#888]">
              {weeks > 0 ? (
                <><span className="text-white font-semibold">{weeks}</span> sem. restantes</>
              ) : (
                <span className="text-[#555]">Course passée</span>
              )}
            </span>
          </div>

          {/* Volume actuel (si profil rempli) */}
          {profile && (profile.weekly_distance_km || profile.weekly_elevation_gain_m) && (
            <div className="flex items-center gap-1.5">
              {/* Icône activité SVG */}
              <svg className="w-3.5 h-3.5 text-[#555] shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                <path d="M1 8 L4 5 L7 9 L10 4 L13 7 L15 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-[#888]">
                {profile.weekly_distance_km && (
                  <><span className="text-white font-semibold">{profile.weekly_distance_km}</span> km/sem</>
                )}
                {profile.weekly_distance_km && profile.weekly_elevation_gain_m && (
                  <> · </>
                )}
                {profile.weekly_elevation_gain_m && (
                  <>D+ <span className="text-white font-semibold">{profile.weekly_elevation_gain_m.toLocaleString('fr-FR')}</span> m</>
                )}
              </span>
            </div>
          )}

          {/* Aucun profil rempli */}
          {(!profile || (!profile.weekly_distance_km && !profile.weekly_elevation_gain_m)) && (
            <span className="text-xs text-[#555] italic">Profil incomplet</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Composant principal ────────────────────────────────────────────────────────

export function PreparationsList({ goals }: PreparationsListProps) {
  // État vide : aucune préparation
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Icône trophée SVG */}
        <svg className="w-12 h-12 text-[#333] mb-4" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
          <path d="M24 34v6M16 40h16" strokeLinecap="round" />
          <path d="M8 8h4v16a12 12 0 0024 0V8h4" strokeLinecap="round" />
          <path d="M12 8V6h24v2" strokeLinecap="round" />
          <path d="M12 18c-3 0-6-3-6-6V8h6M36 18c3 0 6-3 6-6V8h-6" strokeLinecap="round" />
        </svg>
        <p className="font-bold text-white text-sm mb-1">Aucun objectif</p>
        <p className="text-xs text-[#555] max-w-[220px]">
          Tes sportifs n&apos;ont pas encore créé d&apos;objectif course.
          Ils peuvent en créer un depuis leur espace client.
        </p>
      </div>
    )
  }

  // Séparer les préparations par statut pour afficher les actives en premier
  const active = goals.filter((g) => g.status === 'active')
  const pending = goals.filter((g) => g.status === 'pending')
  const others = goals.filter((g) => g.status !== 'active' && g.status !== 'pending')

  const sorted = [...active, ...pending, ...others]

  return (
    <div className="space-y-3">
      {/* Titre de section */}
      <div className="flex items-center justify-between">
        <h1 className="font-extrabold text-white text-lg" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Objectifs sportifs
        </h1>
        <span className="text-xs text-[#555]">{goals.length} dossier{goals.length > 1 ? 's' : ''}</span>
      </div>

      {/* Liste des cartes */}
      {sorted.map((goal) => (
        <PreparationCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}
