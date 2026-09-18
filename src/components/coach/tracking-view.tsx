// Composant affichant les feedbacks et la progression des exercices d'un client
import type { WeekWithSessions } from '@/lib/types'

interface TrackingViewProps {
  weeks: WeekWithSessions[]
  clientName: string
}

export function TrackingView({ weeks, clientName }: TrackingViewProps) {
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Suivi de {clientName}</h2>

      {sortedWeeks.map((week) => (
        <div key={week.id} className="mb-6">
          <h3 className="font-bold text-gray-700 mb-2">Semaine {week.week_number}</h3>

          {week.sessions
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => (
              <div key={session.id} className="mb-4 bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {session.name}
                  {session.day_of_week && <span className="text-gray-400 ml-2 text-sm">{session.day_of_week}</span>}
                </h4>

                <div className="space-y-2">
                  {session.session_exercises
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((se) => {
                      const log = se.exercise_log
                      return (
                        <div
                          key={se.id}
                          className={`flex items-start justify-between p-2 rounded-lg ${
                            log?.completed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 ${log?.completed ? 'text-green-500' : 'text-gray-300'}`}>
                              {log?.completed ? '✓' : '○'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{se.exercise.name}</p>
                              <p className="text-xs text-gray-500">
                                {se.sets}x{se.reps} • repos {se.rest_seconds}s
                              </p>
                              {log?.feedback && (
                                <p className="text-sm text-blue-600 mt-1 italic">
                                  &quot;{log.feedback}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                          {log?.completed_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(log.completed_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
        </div>
      ))}

      {sortedWeeks.length === 0 && (
        <p className="text-gray-500 text-center py-8">Aucun programme actif pour ce client.</p>
      )}
    </div>
  )
}
