// Carte client — avatar initiales, progression, activité, actions rapides
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { relativeDate } from '@/lib/date-utils'

interface ClientCardProps {
  client: Profile
  programStatus: string | null
  completionPercent: number
  lastActivityAt?: string | null
}

function getInitials(client: Profile): string {
  if (client.first_name && client.last_name) {
    return `${client.first_name[0]}${client.last_name[0]}`.toUpperCase()
  }
  return (client.full_name?.[0] ?? '?').toUpperCase()
}

function getActivityInfo(lastActivityAt: string | null | undefined) {
  if (!lastActivityAt) {
    return { text: 'Jamais connecté', dot: 'bg-[#555]' }
  }
  const diffMs = Date.now() - new Date(lastActivityAt).getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const label = relativeDate(lastActivityAt)

  if (diffDays < 3) return { text: `Actif ${label}`, dot: 'bg-emerald-500' }
  if (diffDays < 7) return { text: `${label}`, dot: 'bg-[#d4ff00]' }
  return { text: `${label}`, dot: 'bg-red-400' }
}

export function ClientCard({ client, programStatus, completionPercent, lastActivityAt }: ClientCardProps) {
  const initials = getInitials(client)
  const activity = getActivityInfo(lastActivityAt)
  const name = (client.first_name && client.last_name)
    ? `${client.first_name} ${client.last_name}`
    : client.full_name

  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#333] transition-all duration-200 overflow-hidden">
      <Link href={`/coach/clients/${client.id}/program`} className="block p-4">
        <div className="flex items-center gap-3">
          {/* Avatar initiales */}
          <div className="w-11 h-11 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
            <span className="text-[#d4ff00] font-bold text-sm">{initials}</span>
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-white text-sm truncate">{name}</p>
              {programStatus && (
                <span className="text-sm font-bold text-[#d4ff00] shrink-0">{completionPercent}%</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activity.dot} shrink-0`} />
              <span className="text-xs text-[#888] truncate">{activity.text}</span>
              {client.objective && (
                <>
                  <span className="text-[#333]">·</span>
                  <span className="text-xs text-[#666] truncate">{client.objective}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        {programStatus && (
          <div className="mt-3 w-full bg-[#242424] rounded-full h-1">
            <div
              className="bg-[#d4ff00] h-1 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        )}

        {!programStatus && (
          <p className="text-xs text-[#555] mt-2 italic">Aucun plan actif</p>
        )}
      </Link>

      {/* Actions */}
      <div className="flex border-t border-[#242424]">
        <Link
          href={`/coach/clients/${client.id}/program`}
          className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#888] hover:text-[#d4ff00] hover:bg-[#242424] transition-colors"
        >
          Plan
        </Link>
        {programStatus && (
          <Link
            href={`/coach/clients/${client.id}/tracking`}
            className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#888] hover:text-[#d4ff00] hover:bg-[#242424] transition-colors border-l border-[#242424]"
          >
            Suivi
          </Link>
        )}
        <Link
          href={`/coach/clients/${client.id}`}
          className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#888] hover:text-[#d4ff00] hover:bg-[#242424] transition-colors border-l border-[#242424]"
        >
          Fiche
        </Link>
      </div>
    </div>
  )
}
