'use client'

// Vue interactive du programme : navigateur de semaines + progression de la semaine
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

  // Progression de la semaine : nombre de séances complétées
  const totalSessions = sortedSessions.length
  const completedSessions = sortedSessions.filter(isSessionCompleted).length
  const weekPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <div>
      {/* Bannière motivationnelle */}
      <div className="relative h-32 rounded-2xl overflow-hidden mb-6">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4">
          <h1 className="text-xl font-bold text-white">Hello {firstName}</h1>
          <p className="text-sm text-[#d4ff00]">Ton programme t&apos;attend</p>
          <p className="text-xs text-[#888] mt-0.5">{program.name}</p>
        </div>
      </div>

      <WeekNavigator
        weekNumbers={sortedWeeks.map(w => w.week_number)}
        currentWeek={currentWeekNum}
        onChange={setCurrentWeekNum}
      />

      {/* Progression de la semaine */}
      {totalSessions > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar percent={weekPercent} className="flex-1" />
          <span className="text-xs font-medium text-[#888] shrink-0">
            {completedSessions}/{totalSessions} séance{totalSessions > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Liste des séances */}
      <div className="mt-3 space-y-3">
        {sortedSessions.map((session, index) => {
          const done = isSessionCompleted(session)

          // Nom du workout
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
            />
          )
        })}

        {totalSessions === 0 && (
          <p className="text-[#888] text-center py-8">Pas de séance cette semaine.</p>
        )}
      </div>
    </div>
  )
}
