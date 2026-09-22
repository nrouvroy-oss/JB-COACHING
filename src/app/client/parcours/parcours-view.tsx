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
    sessions: {
      id: string
      session_log: any
    }[]
  }[]
}

interface ParcoursViewProps {
  activeProgram: ProgramData | null
  completedPrograms: ProgramData[]
  userId: string
}

// Compte les séances complétées dans un programme pour un client donné
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

// Formate une date en "Mois Année"
function formatMonth(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function ParcoursView({ activeProgram, completedPrograms, userId }: ParcoursViewProps) {
  const activeStats = activeProgram ? getProgramStats(activeProgram, userId) : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mon parcours</h1>

      {/* Programme en cours */}
      {activeProgram && activeStats && (
        <div className="mb-8">
          <p className="text-xs font-medium text-[#888] uppercase tracking-wide mb-3">Plan en cours</p>
          <div className="bg-[#1c1c1c] rounded-xl border border-[#d4ff00]/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-white">{activeProgram.name}</h2>
              <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                En cours
              </span>
            </div>
            <p className="text-xs text-[#888] mb-3">
              {activeStats.totalWeeks} semaine{activeStats.totalWeeks > 1 ? 's' : ''} · Commencé en {formatMonth(activeProgram.created_at)}
            </p>
            <div className="flex items-center gap-3">
              <ProgressBar percent={activeStats.totalSessions > 0 ? Math.round((activeStats.completedSessions / activeStats.totalSessions) * 100) : 0} className="flex-1" />
              <span className="text-xs font-medium text-[#888] shrink-0">
                {activeStats.completedSessions}/{activeStats.totalSessions} séances
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Programmes terminés */}
      <div>
        <p className="text-xs font-medium text-[#888] uppercase tracking-wide mb-3">Plans terminés</p>

        {completedPrograms.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-6 text-center">
            <p className="text-[#777] text-sm">Pas encore de plan terminé.</p>
            <p className="text-[#555] text-xs mt-1">Tes plans complétés apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedPrograms.map((program) => {
              const stats = getProgramStats(program, userId)
              const percent = stats.totalSessions > 0
                ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                : 0

              return (
                <div key={program.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white">{program.name}</h3>
                    <span className="text-xs text-[#888]">{percent}%</span>
                  </div>
                  <p className="text-xs text-[#888] mb-2">
                    {formatMonth(program.created_at)} · {stats.totalWeeks} semaine{stats.totalWeeks > 1 ? 's' : ''} · {stats.completedSessions}/{stats.totalSessions} séances
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
