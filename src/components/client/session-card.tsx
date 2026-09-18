// Carte de séance cliquable avec barre de progression
import Link from 'next/link'
import { ProgressBar } from '@/components/ui/progress-bar'

interface SessionCardProps {
  sessionId: string
  name: string
  dayOfWeek: string
  completedCount: number
  totalCount: number
}

export function SessionCard({ sessionId, name, dayOfWeek, completedCount, totalCount }: SessionCardProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Link
      href={`/client/session/${sessionId}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          {dayOfWeek && <p className="text-sm text-gray-500">{dayOfWeek}</p>}
        </div>
        <span className="text-sm font-medium text-gray-500">
          {completedCount}/{totalCount}
        </span>
      </div>
      <ProgressBar percent={percent} />
    </Link>
  )
}
