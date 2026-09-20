'use client'

// Partie client du tableau de bord coach — stats, feedbacks, actions rapides et liste clients
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/coach/stat-card'
import { FeedbackItem } from '@/components/coach/feedback-item'
import type { Profile } from '@/lib/types'

// ── Types des props ──────────────────────────────────────────────────────────

interface InactiveClient {
  id: string
  name: string
  lastActivity: string | null
}

interface DashboardStats {
  clientCount: number
  activeThisWeek: number
  recentFeedbackCount: number
}

// Type du feedback tel que retourné par la requête Supabase avec jointures
// Supabase renvoie les relations 1-to-many sous forme de tableau
interface FeedbackEntry {
  id: string
  feedback: string | null
  completed_at: string | null
  // Supabase renvoie un tableau même pour les FK directes selon la config
  client: { id: string; full_name: string; first_name?: string | null; last_name?: string | null } | { id: string; full_name: string; first_name?: string | null; last_name?: string | null }[] | null
  session_exercise: {
    exercise: { name: string } | { name: string }[] | null
  } | {
    exercise: { name: string } | { name: string }[] | null
  }[] | null
}

interface CoachDashboardClientProps {
  stats: DashboardStats
  recentFeedbacks: FeedbackEntry[]
  lastActiveClient: Profile | null
  inactiveClients: InactiveClient[]
  coachFirstName?: string
}

// ── Composant principal ──────────────────────────────────────────────────────

export function CoachDashboardClient({
  stats,
  recentFeedbacks,
  lastActiveClient,
  inactiveClients,
  coachFirstName = 'Coach',
}: CoachDashboardClientProps) {

  return (
    <div className="space-y-8">
      {/* ── En-tête — bannière avec photo de fond ──────────────────────── */}
      <div className="relative h-28 rounded-2xl overflow-hidden mb-2">
        <img
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4">
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm text-[#888]">Bienvenue, {coachFirstName}</p>
        </div>
      </div>

      {/* ── Cartes statistiques ─────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Clients"
            value={stats.clientCount}
            icon="👥"
          />
          <StatCard
            label="Actifs cette semaine"
            value={`${stats.activeThisWeek}/${stats.clientCount}`}
            icon="🔥"
          />
          <StatCard
            label="Feedbacks"
            value={stats.recentFeedbackCount}
            icon="💬"
          />
        </div>
      </section>

      {/* ── Clients inactifs cette semaine ─────────────────────────────── */}
      {inactiveClients.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Clients inactifs cette semaine</h2>
          <div className="space-y-2">
            {inactiveClients.map((client) => (
              <Link
                key={client.id}
                href={`/coach/clients/${client.id}/program`}
                className="flex items-center justify-between bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] p-3 transition-all"
              >
                <span className="text-sm font-medium text-white">{client.name}</span>
                <span className="text-xs text-[#888]">
                  {client.lastActivity ? `Dernière activité : ${new Date(client.lastActivity).toLocaleDateString('fr-FR')}` : 'Jamais connecté'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Actions rapides ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          {/* Lien vers la page clients */}
          <Link href="/coach/clients">
            <Button size="sm">
              Mes clients
            </Button>
          </Link>

          {/* Lien vers les modèles de programmes */}
          <Link href="/coach/programs">
            <Button variant="secondary" size="sm">
              Programmes
            </Button>
          </Link>

          {/* Lien vers la bibliothèque d'exercices */}
          <Link href="/coach/exercises">
            <Button variant="secondary" size="sm">
              Exercices
            </Button>
          </Link>

          {/* Raccourci vers le dernier client actif */}
          {lastActiveClient && (
            <Link href={`/coach/clients/${lastActiveClient.id}/program`}>
              <Button variant="secondary" size="sm">
                {/* Affiche prénom + nom, repli sur full_name pour les anciens comptes */}
                Dernier actif : {(lastActiveClient.first_name && lastActiveClient.last_name)
                  ? `${lastActiveClient.first_name} ${lastActiveClient.last_name}`
                  : lastActiveClient.full_name}
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* ── Feedbacks récents ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">Feedbacks récents</h2>

        {recentFeedbacks.length === 0 ? (
          <p className="text-[#888] text-sm py-4 text-center">
            Aucun feedback pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {recentFeedbacks.map((entry) => {
              // Ignorer les entrées dont les données jointes sont manquantes
              if (!entry.client || !entry.feedback) return null

              // Normalisation : Supabase peut renvoyer un objet ou un tableau selon la relation
              const clientData = Array.isArray(entry.client) ? entry.client[0] : entry.client
              if (!clientData) return null

              const seData = Array.isArray(entry.session_exercise)
                ? entry.session_exercise[0]
                : entry.session_exercise
              const exData = seData?.exercise
                ? (Array.isArray(seData.exercise) ? seData.exercise[0] : seData.exercise)
                : null
              const exerciseName = exData?.name ?? 'Exercice inconnu'

              return (
                <FeedbackItem
                  key={entry.id}
                  clientId={clientData.id}
                  clientName={
                    (clientData.first_name && clientData.last_name)
                      ? `${clientData.first_name} ${clientData.last_name}`
                      : clientData.full_name
                  }
                  exerciseName={exerciseName}
                  feedback={entry.feedback}
                  completedAt={entry.completed_at}
                />
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
