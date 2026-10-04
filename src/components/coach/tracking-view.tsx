// Vue suivi client — stats, progression par semaine, feedbacks mis en avant
import type { WeekWithSessions } from '@/lib/types'
import { ProgressBar } from '@/components/ui/progress-bar'

interface TrackingViewProps {
  weeks: WeekWithSessions[]
  clientName: string
}

interface SessionStats {
  name: string
  dayOfWeek: string
  totalExercises: number
  completedExercises: number
  completedAt: string | null
  feedbacks: { exerciseName: string; feedback: string; date: string | null }[]
}

function getSessionStats(session: any): SessionStats {
  let total = 0
  let completed = 0
  let latestDate: string | null = null
  const feedbacks: SessionStats['feedbacks'] = []

  for (const se of (session.session_exercises ?? [])) {
    total++
    const log = se.exercise_log
    if (log?.completed) {
      completed++
      if (log.completed_at && (!latestDate || log.completed_at > latestDate)) {
        latestDate = log.completed_at
      }
    }
    if (log?.feedback) {
      feedbacks.push({
        exerciseName: se.exercise?.name ?? 'Exercice',
        feedback: log.feedback,
        date: log.completed_at,
      })
    }
  }

  return {
    name: session.name,
    dayOfWeek: session.day_of_week ?? '',
    totalExercises: total,
    completedExercises: completed,
    completedAt: latestDate,
    feedbacks,
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function TrackingView({ weeks, clientName }: TrackingViewProps) {
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  // Stats globales
  let totalSessions = 0
  let completedSessions = 0
  let totalFeedbacks = 0
  const allFeedbacks: { clientName: string; exerciseName: string; feedback: string; date: string | null; sessionName: string }[] = []

  const weekData = sortedWeeks.map((week) => {
    const sessions = [...week.sessions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => {
        const stats = getSessionStats(s)
        totalSessions++
        if (stats.totalExercises > 0 && stats.completedExercises === stats.totalExercises) completedSessions++
        totalFeedbacks += stats.feedbacks.length
        for (const fb of stats.feedbacks) {
          allFeedbacks.push({ ...fb, clientName, sessionName: stats.name })
        }
        return stats
      })
    const weekTotal = sessions.reduce((a, s) => a + s.totalExercises, 0)
    const weekCompleted = sessions.reduce((a, s) => a + s.completedExercises, 0)
    return { weekNumber: week.week_number, sessions, weekTotal, weekCompleted }
  })

  const globalPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  // Trier les feedbacks par date (récent en premier)
  allFeedbacks.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  if (sortedWeeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-[#888]">Aucun programme actif pour ce client</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>
        Suivi de {clientName}
      </h2>

      {/* Stats résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3 text-center">
          <p className="text-2xl font-bold text-[#d4ff00] tabular-nums">{globalPercent}%</p>
          <p className="text-xs text-[#888]">Complété</p>
        </div>
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{completedSessions}/{totalSessions}</p>
          <p className="text-xs text-[#888]">Séances</p>
        </div>
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{totalFeedbacks}</p>
          <p className="text-xs text-[#888]">Feedbacks</p>
        </div>
      </div>

      {/* Progression par semaine */}
      <section>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Progression
        </h3>
        <div className="space-y-3">
          {weekData.map((week) => {
            const weekPercent = week.weekTotal > 0 ? Math.round((week.weekCompleted / week.weekTotal) * 100) : 0
            return (
              <div key={week.weekNumber} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 text-[#d4ff00] flex items-center justify-center text-xs font-bold shrink-0">
                      S{week.weekNumber}
                    </span>
                    <span className="text-sm font-bold text-white">Semaine {week.weekNumber}</span>
                  </div>
                  <span className="text-sm font-bold text-[#d4ff00] tabular-nums">{weekPercent}%</span>
                </div>
                <ProgressBar percent={weekPercent} />
                {/* Séances de la semaine */}
                <div className="grid gap-1.5 mt-3">
                  {week.sessions.map((session, i) => {
                    const isDone = session.totalExercises > 0 && session.completedExercises === session.totalExercises
                    return (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDone ? 'bg-emerald-500/10' : 'bg-[#242424]'}`}>
                        {isDone ? (
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#555] shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${isDone ? 'text-emerald-400' : 'text-white'}`}>{session.name}</span>
                        {session.dayOfWeek && <span className="text-xs text-[#666]">{session.dayOfWeek}</span>}
                        {session.completedAt && <span className="text-xs text-[#888]">{formatDate(session.completedAt)}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Feedbacks */}
      {allFeedbacks.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Feedbacks ({allFeedbacks.length})
          </h3>
          <div className="space-y-2">
            {allFeedbacks.map((fb, i) => (
              <div key={i} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#d4ff00] font-medium">{fb.exerciseName}</span>
                  {fb.date && <span className="text-xs text-[#666]">{formatDate(fb.date)}</span>}
                </div>
                <p className="text-sm text-[#aaa] italic leading-relaxed">&ldquo;{fb.feedback}&rdquo;</p>
                <p className="text-xs text-[#555] mt-1">{fb.sessionName}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
