// Feedback client — avatar initiales, exercice, texte, date
import Link from 'next/link'
import { relativeDate } from '@/lib/date-utils'

interface FeedbackItemProps {
  clientId: string
  clientName: string
  exerciseName: string
  feedback: string
  completedAt: string | null
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name[0]?.toUpperCase() ?? '?'
}

export function FeedbackItem({ clientId, clientName, exerciseName, feedback, completedAt }: FeedbackItemProps) {
  return (
    <Link
      href={`/coach/clients/${clientId}/tracking`}
      className="flex gap-3 bg-[#1c1c1c] rounded-xl p-3 border border-[#2a2a2a] hover:border-[#333] transition-all min-h-[56px]"
    >
      <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#888] font-bold text-xs">{getInitials(clientName)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white truncate">{clientName}</span>
          <span className="text-xs text-[#666] shrink-0">{relativeDate(completedAt)}</span>
        </div>
        <p className="text-xs text-[#d4ff00] font-medium">{exerciseName}</p>
        <p className="text-sm text-[#888] mt-0.5 leading-relaxed line-clamp-2">&ldquo;{feedback}&rdquo;</p>
      </div>
    </Link>
  )
}
