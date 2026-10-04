// Carte de séance — visuel clair avec statut, type, durée et CTA
import Link from 'next/link'

// Traductions françaises des types de séance
const SESSION_TYPE_LABELS: Record<string, string> = {
  easy_run: 'Endurance facile',
  endurance: 'Endurance',
  recovery_run: 'Récupération',
  tempo: 'Tempo',
  threshold: 'Seuil',
  intervals: 'Fractionné',
  hill_repeats: 'Côtes',
  uphill_training: 'Montée',
  downhill_training: 'Descente',
  technical_trail: 'Trail technique',
  long_run: 'Sortie longue',
  long_trail: 'Sortie trail',
  race_specific: 'Spécifique',
  strength_training: 'Renfo',
  mobility: 'Mobilité',
  cross_training: 'Cross-training',
  rest: 'Repos',
  taper: 'Affûtage',
  race: 'Course',
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

interface SessionCardProps {
  sessionId: string
  name: string
  dayOfWeek: string
  workoutName?: string
  completed?: boolean
  sessionType?: string | null
  durationMinutes?: number | null
  elevationGainM?: number | null
  objective?: string | null
}

export function SessionCard({ sessionId, name, dayOfWeek, workoutName, completed, sessionType, durationMinutes, elevationGainM, objective }: SessionCardProps) {
  const typeLabel = sessionType ? SESSION_TYPE_LABELS[sessionType] ?? sessionType : null

  return (
    <Link
      href={`/client/session/${sessionId}`}
      className={`block rounded-2xl border transition-all duration-200 overflow-hidden ${
        completed
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-[#1c1c1c] border-[#2a2a2a] hover:border-[#3a3a3a]'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Indicateur fait/pas fait */}
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
            completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-[#333]'
          }`}>
            {completed && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Nom de la séance */}
            <h3 className={`font-bold text-sm ${completed ? 'text-emerald-400' : 'text-white'}`}>{name}</h3>

            {/* Badges : type + durée + D+ */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {typeLabel && (
                <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                  {typeLabel}
                </span>
              )}
              {workoutName && !typeLabel && (
                <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                  {workoutName}
                </span>
              )}
              {durationMinutes && (
                <span className="bg-[#242424] text-[#aaa] text-xs px-2 py-0.5 rounded-full">
                  {formatDuration(durationMinutes)}
                </span>
              )}
              {elevationGainM && (
                <span className="bg-[#242424] text-[#aaa] text-xs px-2 py-0.5 rounded-full">
                  {elevationGainM}m D+
                </span>
              )}
            </div>

            {/* Jour + objectif */}
            {dayOfWeek && <p className="text-xs text-[#666] mt-1">{dayOfWeek}</p>}
            {objective && <p className="text-xs text-[#888] mt-1 italic line-clamp-1">{objective}</p>}
          </div>

          {/* CTA */}
          {!completed ? (
            <span className="bg-[#d4ff00] text-black text-xs font-bold px-4 py-2 min-h-[44px] rounded-full flex items-center shrink-0">
              Go
            </span>
          ) : (
            <span className="text-xs text-emerald-500 font-medium shrink-0 min-h-[44px] flex items-center">
              Fait
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
