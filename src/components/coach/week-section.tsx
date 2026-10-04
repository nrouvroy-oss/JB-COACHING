'use client'

// Section semaine du programme — accordéon avec séances
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionEditor } from '@/components/coach/session-editor'
import { deleteWeek, addSession } from '@/app/coach/clients/[id]/program/actions'
import type { WeekWithSessions, Exercise } from '@/lib/types'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface WorkoutExerciseItem {
  id: string
  order_index: number
  coach_notes: string
  exercise: { id: string; name: string; category: string; video_url: string }
}

interface WorkoutOption {
  id: string
  name: string
  workout_exercises: WorkoutExerciseItem[]
}

interface WeekSectionProps {
  week: WeekWithSessions
  exercises: Exercise[]
  clientId: string
  workouts?: WorkoutOption[]
}

export function WeekSection({ week, exercises, clientId, workouts = [] }: WeekSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const router = useRouter()

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleAddSession() {
    if (!sessionName.trim()) return
    const days = selectedDays.length > 0 ? selectedDays.join(', ') : ''
    await addSession(week.id, sessionName, days, clientId)
    setSessionName('')
    setSelectedDays([])
    setShowAddSession(false)
    router.refresh()
  }

  async function handleDeleteWeek() {
    if (!confirm(`Supprimer la semaine ${week.week_number} et toutes ses séances ?`)) return
    await deleteWeek(week.id, clientId)
    router.refresh()
  }

  const sessionCount = week.sessions?.length ?? 0

  return (
    <div className="rounded-2xl overflow-hidden border border-[#2a2a2a]">
      {/* En-tête semaine */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 bg-[#1c1c1c] hover:bg-[#202020] transition-colors min-h-[56px]"
      >
        <span
          className="w-9 h-9 rounded-xl bg-[#d4ff00] text-black flex items-center justify-center font-extrabold text-sm shrink-0"
          style={{ fontFamily: 'Bricolage Grotesque' }}
        >
          S{week.week_number}
        </span>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-white text-sm">Semaine {week.week_number}</h3>
          <p className="text-xs text-[#666]">{sessionCount} séance{sessionCount !== 1 ? 's' : ''}</p>
        </div>
        <svg
          className={`w-4 h-4 text-[#666] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="bg-[#141414] p-3 space-y-3">
          {/* Séances de la semaine */}
          {[...week.sessions]
            .sort((a, b) => a.order_index - b.order_index)
            .map((session, index) => (
              <SessionEditor
                key={session.id}
                session={session}
                sessionNumber={index + 1}
                exercises={exercises}
                clientId={clientId}
                workouts={workouts}
              />
            ))}

          {/* Formulaire d'ajout de séance */}
          {showAddSession ? (
            <div className="bg-[#1c1c1c] rounded-xl p-4 border border-[#2a2a2a] space-y-3">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={`Ex: Séance ${sessionCount + 1} — Haut du corps`}
                className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#555]"
              />
              <div>
                <p className="text-xs text-[#888] mb-2">Jour (optionnel)</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                        selectedDays.includes(d)
                          ? 'bg-[#d4ff00] text-black'
                          : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSession} className="flex-1">Ajouter</Button>
                <Button size="sm" variant="secondary" onClick={() => { setShowAddSession(false); setSelectedDays([]) }}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSession(true)}
                className="flex-1 py-3 min-h-[44px] rounded-xl border border-dashed border-[#333] text-sm text-[#888] hover:border-[#d4ff00]/30 hover:text-[#d4ff00] transition-colors"
              >
                + Ajouter une séance
              </button>
              <button
                onClick={handleDeleteWeek}
                className="px-4 py-3 min-h-[44px] rounded-xl text-xs text-[#555] hover:text-red-400 transition-colors"
                aria-label="Supprimer la semaine"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
