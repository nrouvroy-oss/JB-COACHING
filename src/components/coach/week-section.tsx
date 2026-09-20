'use client'

// Accordéon représentant une semaine du programme avec ses séances
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionEditor } from '@/components/coach/session-editor'
import { deleteWeek, addSession } from '@/app/coach/clients/[id]/program/actions'
import type { WeekWithSessions, Exercise } from '@/lib/types'

// Jours suggérés (optionnel, juste une indication pour le client)
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

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

  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* En-tête accordéon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#242424] transition-colors"
      >
        <h3 className="font-bold text-white">Semaine {week.week_number}</h3>
        <span className="text-[#777]">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
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
            <div className="space-y-2">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={`Ex: Séance ${(week.sessions?.length ?? 0) + 1} - Haut du corps`}
                className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] placeholder:text-[#777]"
              />
              <p className="text-xs text-[#888]">Jour suggéré (optionnel) :</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedDays.includes(d)
                        ? 'bg-[#d4ff00] text-black'
                        : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSession}>OK</Button>
                <Button size="sm" variant="secondary" onClick={() => { setShowAddSession(false); setSelectedDays([]) }}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowAddSession(true)}>+ Séance</Button>
              <Button size="sm" variant="danger" onClick={handleDeleteWeek}>Suppr. semaine</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
