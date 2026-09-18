'use client'

// Vue interactive du programme : navigateur de semaines + liste des séances
import { useState } from 'react'
import { WeekNavigator } from '@/components/client/week-navigator'
import { SessionCard } from '@/components/client/session-card'
import type { ProgramWithWeeks } from '@/lib/types'

interface ClientProgramViewProps {
  program: ProgramWithWeeks
}

export function ClientProgramView({ program }: ClientProgramViewProps) {
  const sortedWeeks = [...program.weeks].sort((a, b) => a.week_number - b.week_number)
  const [currentWeekNum, setCurrentWeekNum] = useState(sortedWeeks[0]?.week_number ?? 1)

  const currentWeek = sortedWeeks.find((w) => w.week_number === currentWeekNum)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">{program.name}</h1>

      <WeekNavigator
        totalWeeks={sortedWeeks.length}
        currentWeek={currentWeekNum}
        onChange={setCurrentWeekNum}
      />

      <div className="mt-4 space-y-3">
        {currentWeek?.sessions
          .sort((a, b) => a.order_index - b.order_index)
          .map((session) => {
            const total = session.session_exercises.length
            const completed = session.session_exercises.filter(
              (se) => {
                // exercise_log peut être un tableau (relation 1:N) ou un objet selon la requête
                const logs = (se as unknown as { exercise_log: unknown }).exercise_log
                if (Array.isArray(logs)) return logs.some((l: { completed: boolean }) => l.completed)
                return (logs as { completed?: boolean } | null)?.completed ?? false
              }
            ).length

            return (
              <SessionCard
                key={session.id}
                sessionId={session.id}
                name={session.name}
                dayOfWeek={session.day_of_week}
                completedCount={completed}
                totalCount={total}
              />
            )
          })}

        {(!currentWeek || currentWeek.sessions.length === 0) && (
          <p className="text-gray-500 text-center py-8">Pas de séance cette semaine.</p>
        )}
      </div>
    </div>
  )
}
