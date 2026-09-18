// Carte affichant les infos d'un client avec sa progression dans le programme actif
import Link from 'next/link'
import type { Profile } from '@/lib/types'

interface ClientCardProps {
  client: Profile
  programStatus: string | null
  completionPercent: number
}

export function ClientCard({ client, programStatus, completionPercent }: ClientCardProps) {
  return (
    <Link
      href={`/coach/clients/${client.id}/program`}
      className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{client.full_name}</p>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
        {programStatus ? (
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{completionPercent}%</p>
            <p className="text-xs text-gray-400">complété</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Aucun programme</p>
        )}
      </div>
      {programStatus && (
        <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      )}
    </Link>
  )
}
