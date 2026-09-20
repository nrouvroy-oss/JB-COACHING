// Carte de séance cliquable avec badge programme et statut
import Link from 'next/link'

interface SessionCardProps {
  sessionId: string
  name: string
  dayOfWeek: string
  workoutName?: string
  completed?: boolean
}

export function SessionCard({ sessionId, name, dayOfWeek, workoutName, completed }: SessionCardProps) {
  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${
      completed
        ? 'bg-green-500/5 border-green-500/20'
        : 'bg-[#1c1c1c] border-[#2a2a2a] hover:border-[#3a3a3a]'
    }`}>
      <div className="flex items-center justify-between gap-3">
        {/* Infos de la séance */}
        <Link href={`/client/session/${sessionId}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Indicateur fait/pas fait */}
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs ${
              completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-[#444]'
            }`}>
              {completed && '✓'}
            </span>
            <h3 className={`font-semibold ${completed ? 'text-green-400' : 'text-white'}`}>{name}</h3>
          </div>
          {workoutName && (
            <span className="inline-block mt-1.5 ml-7 bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
              {workoutName}
            </span>
          )}
          {dayOfWeek && <p className="text-xs text-[#888] mt-1 ml-7">{dayOfWeek}</p>}
        </Link>

        {/* Bouton Commencer — lance le mode entraînement */}
        <Link
          href={`/client/session/${sessionId}/train`}
          className="bg-[#d4ff00] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-[#c2ee00] transition-colors shrink-0"
        >
          Go ▶
        </Link>
      </div>
    </div>
  )
}
