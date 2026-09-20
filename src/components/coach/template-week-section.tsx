'use client'

// Accordéon d'une semaine pour les modèles — utilise les actions de modèle au lieu des actions client
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TemplateSessionEditor } from '@/components/coach/template-session-editor'
import { deleteWeekFromTemplate, addSessionToTemplate } from '@/app/coach/programs/[id]/actions'
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

interface TemplateWeekSectionProps {
  week: WeekWithSessions
  exercises: Exercise[]
  programId: string
  workouts?: WorkoutOption[]
}

export function TemplateWeekSection({ week, exercises, programId, workouts = [] }: TemplateWeekSectionProps) {
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
    await addSessionToTemplate(week.id, sessionName, days, programId)
    setSessionName('')
    setSelectedDays([])
    setShowAddSession(false)
    router.refresh()
  }

  async function handleDeleteWeek() {
    if (!confirm(`Supprimer la semaine ${week.week_number} et toutes ses séances ?`)) return
    await deleteWeekFromTemplate(week.id, programId)
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
              <TemplateSessionEditor
                key={session.id}
                session={session}
                sessionNumber={index + 1}
                exercises={exercises}
                programId={programId}
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
