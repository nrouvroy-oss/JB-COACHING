// Composant affichant un feedback client — nom, exercice, texte du feedback et date relative

import Link from 'next/link'
import { relativeDate } from '@/lib/date-utils'

interface FeedbackItemProps {
  clientId: string
  clientName: string
  exerciseName: string
  feedback: string
  completedAt: string | null
}

export function FeedbackItem({
  clientId,
  clientName,
  exerciseName,
  feedback,
  completedAt,
}: FeedbackItemProps) {
  return (
    <Link
      href={`/coach/clients/${clientId}/tracking`}
      className="block bg-[#1c1c1c] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200"
    >
      {/* En-tête : nom du client et date relative */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-white text-sm">{clientName}</span>
        <span className="text-xs text-[#777] flex-shrink-0">
          {relativeDate(completedAt)}
        </span>
      </div>

      {/* Nom de l'exercice */}
      <p className="text-xs text-[#d4ff00] font-medium mb-2">{exerciseName}</p>

      {/* Texte du feedback en italique */}
      <p className="text-sm text-[#888] italic leading-relaxed">
        &ldquo;{feedback}&rdquo;
      </p>
    </Link>
  )
}
