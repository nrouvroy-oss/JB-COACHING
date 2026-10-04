'use client'

// Vue "Mon parcours" — programme actif + historique des programmes terminés
import { ProgressBar } from '@/components/ui/progress-bar'

interface ProgramData {
  id: string
  name: string
  status: string
  created_at: string
  weeks: {
    id: string
    week_number: number
    sessions: { id: string; session_log: any }[]
  }[]
}

interface ParcoursViewProps {
  activeProgram: ProgramData | null
  completedPrograms: ProgramData[]
  userId: string
}

function getProgramStats(program: ProgramData, userId: string) {
  let totalSessions = 0
  let completedSessions = 0
  for (const week of program.weeks) {
    for (const session of week.sessions) {
      totalSessions++
      const logs = session.session_log
      if (Array.isArray(logs)) {
        if (logs.some((l: any) => l.client_id === userId && l.completed)) completedSessions++
      } else if (logs && (logs as any).client_id === userId && (logs as any).completed) {
        completedSessions++
      }
    }
  }
  return { totalSessions, completedSessions, totalWeeks: program.weeks.length }
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function ParcoursView({ activeProgram, completedPrograms, userId }: ParcoursViewProps) {
  const activeStats = activeProgram ? getProgramStats(activeProgram, userId) : null

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Bricolage Grotesque' }}>Mon parcours</h1>

      {/* Programme en cours */}
      {activeProgram && activeStats && (
        <div className="mb-8">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Plan en cours</p>
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#d4ff00]/20 p-5 relative overflow-hidden">
            {/* Accent lime subtil */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#d4ff00]" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-white text-lg">{activeProgram.name}</h2>
                <p className="text-xs text-[#888] mt-0.5">
                  {activeStats.totalWeeks} semaine{activeStats.totalWeeks > 1 ? 's' : ''} · Commencé en {formatMonth(activeProgram.created_at)}
                </p>
              </div>
              <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2.5 py-1 rounded-full font-bold shrink-0">
                En cours
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar percent={activeStats.totalSessions > 0 ? Math.round((activeStats.completedSessions / activeStats.totalSessions) * 100) : 0} className="flex-1" />
              <span className="text-sm font-bold text-[#d4ff00] tabular-nums shrink-0">
                {activeStats.completedSessions}/{activeStats.totalSessions}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Programmes terminés */}
      <div>
        <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Plans terminés</p>

        {completedPrograms.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M16.5 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0014.02 9.728M16.5 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-2.488 0" />
              </svg>
            </div>
            <p className="text-[#888] text-sm">Pas encore de plan terminé</p>
            <p className="text-[#555] text-xs mt-1">Tes plans complétés apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedPrograms.map((program) => {
              const stats = getProgramStats(program, userId)
              const percent = stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0
              return (
                <div key={program.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{program.name}</h3>
                    <span className="text-sm font-bold text-[#888] tabular-nums">{percent}%</span>
                  </div>
                  <p className="text-xs text-[#666] mb-2">
                    {formatMonth(program.created_at)} · {stats.totalWeeks} sem. · {stats.completedSessions}/{stats.totalSessions} séances
                  </p>
                  <ProgressBar percent={percent} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
