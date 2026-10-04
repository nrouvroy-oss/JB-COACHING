'use client'

// Vue programme client — navigation par semaine + séances avec progression
import { useState } from 'react'
import { WeekNavigator } from '@/components/client/week-navigator'
import { SessionCard } from '@/components/client/session-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { ProgramWithWeeks } from '@/lib/types'

interface ClientProgramViewProps {
  program: ProgramWithWeeks
  firstName: string
}

// Vérifie si une séance est complétée (via session_logs)
function isSessionCompleted(session: any): boolean {
  const logs = session.session_log
  if (Array.isArray(logs)) return logs.some((l: { completed: boolean }) => l.completed)
  return (logs as { completed?: boolean } | null)?.completed ?? false
}

export function ClientProgramView({ program, firstName }: ClientProgramViewProps) {
  const sortedWeeks = [...program.weeks].sort((a, b) => a.week_number - b.week_number)
  const [currentWeekNum, setCurrentWeekNum] = useState(sortedWeeks[0]?.week_number ?? 1)

  const currentWeek = sortedWeeks.find((w) => w.week_number === currentWeekNum)
  const sortedSessions = currentWeek
    ? [...currentWeek.sessions].sort((a, b) => a.order_index - b.order_index)
    : []

  // Progression de la semaine
  const totalSessions = sortedSessions.length
  const completedSessions = sortedSessions.filter(isSessionCompleted).length
  const weekPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  // Volume cible de la semaine si défini
  const weekTargets = currentWeek as any

  return (
    <div>
      {/* En-tête compact */}
      <div className="mb-5">
        <p className="text-sm text-[#888]">Hello {firstName}</p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>
          {program.name}
        </h1>
      </div>

      {/* Sélecteur de semaine */}
      <WeekNavigator
        weekNumbers={sortedWeeks.map(w => w.week_number)}
        currentWeek={currentWeekNum}
        onChange={setCurrentWeekNum}
      />

      {/* Progression de la semaine */}
      {totalSessions > 0 && (
        <div className="mt-4 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">Semaine {currentWeekNum}</span>
            <span className="text-sm font-bold text-[#d4ff00] tabular-nums">{completedSessions}/{totalSessions}</span>
          </div>
          <ProgressBar percent={weekPercent} />
          {/* Volume cible si défini */}
          {(weekTargets?.target_distance_km || weekTargets?.target_duration_minutes || weekTargets?.target_elevation_gain_m) && (
            <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-[#242424]">
              {weekTargets.target_distance_km && (
                <span className="text-xs text-[#888]">{weekTargets.target_distance_km} km</span>
              )}
              {weekTargets.target_duration_minutes && (
                <span className="text-xs text-[#888]">
                  {Math.floor(weekTargets.target_duration_minutes / 60)}h{String(weekTargets.target_duration_minutes % 60).padStart(2, '0')}
                </span>
              )}
              {weekTargets.target_elevation_gain_m && (
                <span className="text-xs text-[#888]">{weekTargets.target_elevation_gain_m}m D+</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Liste des séances */}
      <div className="mt-4 space-y-3">
        {sortedSessions.map((session) => {
          const done = isSessionCompleted(session)
          const workoutData = (session as any).workout
          const workoutName = Array.isArray(workoutData) ? workoutData[0]?.name : workoutData?.name

          return (
            <SessionCard
              key={session.id}
              sessionId={session.id}
              name={session.name}
              dayOfWeek={session.day_of_week}
              workoutName={workoutName}
              completed={done}
              sessionType={(session as any).session_type}
              durationMinutes={(session as any).duration_minutes}
              elevationGainM={(session as any).elevation_gain_m}
              objective={(session as any).objective}
            />
          )
        })}

        {totalSessions === 0 && (
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-8 text-center">
            <p className="text-[#888]">Pas de séance cette semaine.</p>
          </div>
        )}
      </div>
    </div>
  )
}
