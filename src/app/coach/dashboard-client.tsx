'use client'

// Dashboard coach — stats, clients inactifs, feedbacks récents
import Link from 'next/link'
import { StatCard } from '@/components/coach/stat-card'
import { FeedbackItem } from '@/components/coach/feedback-item'
import type { Profile } from '@/lib/types'

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

interface FeedbackEntry {
  id: string
  feedback: string | null
  completed_at: string | null
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

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name[0]?.toUpperCase() ?? '?'
}

function formatRelativeDay(dateStr: string | null): string {
  if (!dateStr) return 'Jamais'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff}j`
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`
  return `Il y a ${Math.floor(diff / 30)} mois`
}

export function CoachDashboardClient({
  stats,
  recentFeedbacks,
  lastActiveClient,
  inactiveClients,
  coachFirstName = 'Coach',
}: CoachDashboardClientProps) {

  return (
    <div className="space-y-6">
      {/* Bannière avec photo de fond */}
      <div className="relative h-28 rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>Tableau de bord</h1>
          <p className="text-sm text-[#888]">Bienvenue, {coachFirstName}</p>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Clients" value={stats.clientCount} icon="clients" />
        <StatCard label="Actifs" value={`${stats.activeThisWeek}/${stats.clientCount}`} icon="active" />
        <StatCard label="Feedbacks" value={stats.recentFeedbackCount} icon="feedback" />
      </div>

      {/* Raccourci dernier client actif → suivi */}
      {lastActiveClient && (
        <Link
          href={`/coach/clients/${lastActiveClient.id}/tracking`}
          className="flex items-center gap-3 bg-[#d4ff00]/[0.05] border border-[#d4ff00]/15 rounded-xl p-4 hover:border-[#d4ff00]/30 transition-all min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
            <span className="text-[#d4ff00] font-bold text-sm">
              {getInitials(
                (lastActiveClient.first_name && lastActiveClient.last_name)
                  ? `${lastActiveClient.first_name} ${lastActiveClient.last_name}`
                  : lastActiveClient.full_name
              )}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {(lastActiveClient.first_name && lastActiveClient.last_name)
                ? `${lastActiveClient.first_name} ${lastActiveClient.last_name}`
                : lastActiveClient.full_name}
            </p>
            <p className="text-xs text-[#d4ff00]">Dernier client actif</p>
          </div>
          <svg className="w-4 h-4 text-[#d4ff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Clients inactifs */}
      {inactiveClients.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Inactifs cette semaine
              <span className="text-xs text-red-400 font-normal">({inactiveClients.length})</span>
            </h2>
          </div>
          <div className="space-y-1.5">
            {inactiveClients.map((client) => (
              <Link
                key={client.id}
                href={`/coach/clients/${client.id}/tracking`}
                className="flex items-center gap-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#333] p-3 transition-all min-h-[52px]"
              >
                <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0">
                  <span className="text-red-400 font-bold text-xs">{getInitials(client.name)}</span>
                </div>
                <span className="text-sm font-medium text-white flex-1 min-w-0 truncate">{client.name}</span>
                <span className="text-xs text-[#666] shrink-0">
                  {formatRelativeDay(client.lastActivity)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feedbacks récents */}
      <section>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          Feedbacks récents
        </h2>

        {recentFeedbacks.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-6 text-center">
            <p className="text-[#888] text-sm">Aucun feedback pour le moment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentFeedbacks.map((entry) => {
              if (!entry.client || !entry.feedback) return null
              const clientData = Array.isArray(entry.client) ? entry.client[0] : entry.client
              if (!clientData) return null
              const seData = Array.isArray(entry.session_exercise) ? entry.session_exercise[0] : entry.session_exercise
              const exData = seData?.exercise ? (Array.isArray(seData.exercise) ? seData.exercise[0] : seData.exercise) : null

              return (
                <FeedbackItem
                  key={entry.id}
                  clientId={clientData.id}
                  clientName={(clientData.first_name && clientData.last_name) ? `${clientData.first_name} ${clientData.last_name}` : clientData.full_name}
                  exerciseName={exData?.name ?? 'Exercice inconnu'}
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
