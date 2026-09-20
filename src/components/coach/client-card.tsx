// Carte affichant les infos d'un client avec sa progression et sa dernière activité
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { relativeDate } from '@/lib/date-utils'

interface ClientCardProps {
  client: Profile
  programStatus: string | null
  completionPercent: number
  /** Date ISO de la dernière complétion d'exercice — null si jamais actif */
  lastActivityAt?: string | null
}

export function ClientCard({ client, programStatus, completionPercent, lastActivityAt }: ClientCardProps) {
  // Calcul de la couleur et du texte d'indicateur d'activité
  function getActivityIndicator() {
    if (!lastActivityAt) {
      return { text: 'Aucune activité', color: 'text-[#777]' }
    }
    const diffMs = Date.now() - new Date(lastActivityAt).getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    const label = `Actif ${relativeDate(lastActivityAt)}`

    if (diffDays < 3) return { text: label, color: 'text-emerald-500' }
    if (diffDays < 7) return { text: label.replace('Actif', 'Inactif depuis'), color: 'text-[#d4ff00]' }
    return { text: label.replace('Actif', 'Inactif depuis'), color: 'text-red-400' }
  }

  const activity = getActivityIndicator()

  return (
    <div className="bg-[#1c1c1c] rounded-xl p-5 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200">
      <Link
        href={`/coach/clients/${client.id}/program`}
        className="block"
      >
        <div className="flex items-center justify-between">
          <div>
            {/* Affiche prénom + nom, repli sur full_name pour les anciens comptes */}
            <p className="font-semibold text-white">
              {(client.first_name && client.last_name)
                ? `${client.first_name} ${client.last_name}`
                : client.full_name}
            </p>
            <p className="text-sm text-[#888]">{client.email}</p>
            {/* Indicateur d'activité récente */}
            <p className={`text-xs mt-0.5 font-medium ${activity.color}`}>{activity.text}</p>
          </div>
          {programStatus ? (
            <div className="text-right">
              <p className="text-lg font-bold text-[#d4ff00]">{completionPercent}%</p>
              <p className="text-xs text-[#888]">complété</p>
            </div>
          ) : (
            <p className="text-sm text-[#777] italic">Aucun programme</p>
          )}
        </div>
        {/* Barre de progression du programme */}
        {programStatus && (
          <div className="mt-3 w-full bg-[#242424] rounded-full h-1.5">
            <div
              className="bg-[#d4ff00] h-1.5 rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        )}
      </Link>
      {/* Liens d'action : suivi et fiche client */}
      <div className="flex items-center gap-4 mt-2">
        {programStatus && (
          <Link
            href={`/coach/clients/${client.id}/tracking`}
            className="text-xs text-[#d4ff00] hover:text-[#c2ee00] font-medium inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            Voir le suivi →
          </Link>
        )}
        {/* Lien vers la fiche détaillée du client */}
        <Link
          href={`/coach/clients/${client.id}`}
          className="text-xs text-[#888] hover:text-[#d4ff00] font-medium inline-block transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Fiche client
        </Link>
      </div>
    </div>
  )
}
