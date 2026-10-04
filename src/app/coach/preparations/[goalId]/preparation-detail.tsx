'use client'

// Dossier sportif côté coach — synthèse profil, plan lié, feedbacks reçus, actions
import { useState } from 'react'
import Link from 'next/link'
import { AthleteProfileCard } from '@/components/coach/athlete-profile-card'
import { publishPreparation, completePreparation } from '../actions'
import type { RaceGoalWithProfile, Program, SessionFeedback, RaceGoalStatus } from '@/lib/types'

interface PreparationDetailProps {
  goal: RaceGoalWithProfile
  program: Program | null
  feedbacks: (SessionFeedback & { session_name?: string })[]
}

// Badge couleur selon le statut de la préparation
function StatusBadge({ status }: { status: RaceGoalStatus }) {
  const config: Record<RaceGoalStatus, { label: string; className: string }> = {
    draft:     { label: 'Brouillon',  className: 'bg-[#333] text-[#888]' },
    pending:   { label: 'À préparer', className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
    active:    { label: 'En cours',   className: 'bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30' },
    completed: { label: 'Terminé',    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  }
  const { label, className } = config[status]
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  )
}

// Libellé lisible pour la complétion d'une séance
function completionLabel(completion: string): { text: string; color: string } {
  if (completion === 'yes')     return { text: 'Séance complète',     color: 'text-emerald-400' }
  if (completion === 'partial') return { text: 'Partiellement réalisée', color: 'text-amber-400' }
  return { text: 'Non réalisée', color: 'text-red-400' }
}

// Libellé ressenti
function feelingLabel(feeling: string | null): string {
  if (!feeling) return ''
  const map: Record<string, string> = {
    great: 'Très bien',
    good: 'Bien',
    tired: 'Fatigué',
    very_tired: 'Très fatigué',
    pain: 'Douleur',
  }
  return map[feeling] ?? feeling
}

// Formater la date en français
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Obtenir les initiales du client
function getInitials(goal: RaceGoalWithProfile): string {
  if (goal.client?.first_name && goal.client?.last_name) {
    return `${goal.client.first_name[0]}${goal.client.last_name[0]}`.toUpperCase()
  }
  return (goal.client?.full_name?.[0] ?? '?').toUpperCase()
}

export function PreparationDetail({ goal, program, feedbacks }: PreparationDetailProps) {
  const [loading, setLoading] = useState<'publish' | 'complete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clientName = goal.client
    ? goal.client.first_name && goal.client.last_name
      ? `${goal.client.first_name} ${goal.client.last_name}`
      : goal.client.full_name
    : 'Client'

  const initials = getInitials(goal)

  // Publier la préparation (pending → active)
  async function handlePublish() {
    setLoading('publish')
    setError(null)
    const result = await publishPreparation(goal.id)
    setLoading(null)
    if (result.error) setError(result.error)
  }

  // Marquer la préparation comme terminée (active → completed)
  async function handleComplete() {
    setLoading('complete')
    setError(null)
    const result = await completePreparation(goal.id)
    setLoading(null)
    if (result.error) setError(result.error)
  }

  return (
    <div>
      {/* Lien retour */}
      <Link
        href="/coach/preparations"
        className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#d4ff00] transition-colors min-h-[44px]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Préparations
      </Link>

      {/* En-tête : client + course + statut */}
      <div className="flex items-start gap-3 mt-2 mb-6">
        {/* Avatar initiales */}
        <div className="w-12 h-12 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
          <span className="text-[#d4ff00] font-extrabold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-white leading-tight">{clientName}</h1>
            <StatusBadge status={goal.status} />
          </div>
          <p className="text-sm text-[#888] mt-0.5 truncate">{goal.race_name}</p>
          <p className="text-xs text-[#666]">{goal.distance_km} km · {goal.elevation_gain_m.toLocaleString('fr-FR')} m D+</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Section : Profil sportif */}
        <div>
          <h2 className="text-xs font-bold text-[#666] uppercase tracking-widest mb-3">Dossier sportif</h2>
          <AthleteProfileCard goal={goal} />
        </div>

        {/* Section : Plan de préparation */}
        <div>
          <h2 className="text-xs font-bold text-[#666] uppercase tracking-widest mb-3">Plan d&apos;entraînement</h2>
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
            {program ? (
              /* Plan existant — lien vers le programme */
              <div>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666] uppercase tracking-wide">Programme lié</p>
                    <p className="text-sm font-bold text-white mt-0.5 truncate">{program.name}</p>
                    {program.phase && (
                      <p className="text-xs text-[#d4ff00] mt-0.5 capitalize">Phase : {program.phase}</p>
                    )}
                  </div>
                  {/* Icône lien */}
                  <svg className="w-5 h-5 text-[#444] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </div>
                <div className="border-t border-[#242424]">
                  <Link
                    href={`/coach/clients/${goal.client_id}/program`}
                    className="flex items-center justify-center gap-2 py-3 min-h-[44px] text-sm font-medium text-[#888] hover:text-[#d4ff00] hover:bg-[#242424] transition-colors"
                  >
                    Voir le programme
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              /* Aucun plan — message d'instruction */
              <div className="p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#888]">Aucun plan créé</p>
                <p className="text-xs text-[#555] mt-1 leading-relaxed max-w-xs mx-auto">
                  Crée un programme pour ce sportif depuis sa fiche client, puis indique l&apos;identifiant de cette préparation dans le champ <span className="text-[#888]">race_goal_id</span>.
                </p>
                <Link
                  href={`/coach/clients/${goal.client_id}/program`}
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#d4ff00] hover:text-white transition-colors font-medium min-h-[44px]"
                >
                  Aller à la fiche client
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section : Feedbacks reçus */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#666] uppercase tracking-widest">Feedbacks reçus</h2>
            {feedbacks.length > 0 && (
              <span className="text-xs text-[#555]">{feedbacks.length} feedback{feedbacks.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {feedbacks.length === 0 ? (
            <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-5 text-center">
              <p className="text-sm text-[#555]">Aucun feedback reçu pour l&apos;instant.</p>
              <p className="text-xs text-[#444] mt-1">Les feedbacks apparaîtront ici après chaque séance terminée.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {feedbacks.map((fb) => {
                const comp = completionLabel(fb.completion)
                return (
                  <div
                    key={fb.id}
                    className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3.5"
                  >
                    {/* Ligne 1 : nom de la séance + date */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-white truncate">{fb.session_name}</p>
                      <span className="text-xs text-[#666] shrink-0">{formatDate(fb.created_at)}</span>
                    </div>

                    {/* Ligne 2 : complétion + RPE + ressenti */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-medium ${comp.color}`}>{comp.text}</span>

                      {fb.difficulty_rpe != null && (
                        <span className="text-xs bg-[#242424] border border-[#333] text-[#aaa] rounded-md px-2 py-0.5">
                          RPE {fb.difficulty_rpe}/10
                        </span>
                      )}

                      {fb.feeling && (
                        <span className="text-xs bg-[#242424] border border-[#333] text-[#aaa] rounded-md px-2 py-0.5">
                          {feelingLabel(fb.feeling)}
                        </span>
                      )}
                    </div>

                    {/* Commentaire libre */}
                    {fb.comment && (
                      <p className="text-sm text-[#888] mt-2 leading-relaxed">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    )}

                    {/* Données réelles de sortie longue */}
                    {(fb.actual_duration_minutes != null || fb.actual_distance_km != null || fb.actual_elevation_m != null) && (
                      <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-[#242424]">
                        {fb.actual_duration_minutes != null && (
                          <span className="text-xs text-[#888]">
                            ⏱ {Math.floor(fb.actual_duration_minutes / 60)}h{String(fb.actual_duration_minutes % 60).padStart(2, '0')}
                          </span>
                        )}
                        {fb.actual_distance_km != null && (
                          <span className="text-xs text-[#888]">📍 {fb.actual_distance_km} km</span>
                        )}
                        {fb.actual_elevation_m != null && (
                          <span className="text-xs text-[#888]">⛰ {fb.actual_elevation_m.toLocaleString('fr-FR')} m D+</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Boutons d'action — selon le statut courant */}
        {(goal.status === 'pending' || goal.status === 'active') && (
          <div className="pt-2 space-y-2">
            {/* Message d'erreur éventuel */}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {/* Publier — disponible quand le statut est 'pending' */}
            {goal.status === 'pending' && (
              <button
                onClick={handlePublish}
                disabled={loading !== null}
                className="w-full min-h-[48px] bg-[#d4ff00] hover:bg-[#c8f200] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading === 'publish' ? 'Publication...' : 'Publier le plan'}
              </button>
            )}

            {/* Terminer — disponible quand le statut est 'active' */}
            {goal.status === 'active' && (
              <button
                onClick={handleComplete}
                disabled={loading !== null}
                className="w-full min-h-[48px] bg-[#1c1c1c] hover:bg-[#242424] text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading === 'complete' ? 'Clôture...' : 'Terminer la préparation'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
