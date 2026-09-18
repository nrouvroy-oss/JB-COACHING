'use client'

// Éditeur d'une séance : affiche les exercices, permet d'en ajouter/supprimer
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExercisePicker } from '@/components/coach/exercise-picker'
import { deleteSession, addExerciseToSession, removeExerciseFromSession } from '@/app/coach/clients/[id]/program/actions'
import type { SessionWithExercises, Exercise } from '@/lib/types'

interface SessionEditorProps {
  session: SessionWithExercises
  exercises: Exercise[]
  clientId: string
}

export function SessionEditor({ session, exercises, clientId }: SessionEditorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()

  async function handleAddExercise(exerciseId: string, sets: number, reps: string, restSeconds: number, coachNotes: string) {
    await addExerciseToSession(session.id, exerciseId, sets, reps, restSeconds, coachNotes, clientId)
    router.refresh()
  }

  async function handleRemoveExercise(sessionExerciseId: string) {
    await removeExerciseFromSession(sessionExerciseId, clientId)
    router.refresh()
  }

  async function handleDeleteSession() {
    if (!confirm(`Supprimer la séance "${session.name}" ?`)) return
    await deleteSession(session.id, clientId)
    router.refresh()
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-gray-900">{session.name}</span>
          {session.day_of_week && (
            <span className="ml-2 text-xs text-gray-500">{session.day_of_week}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowPicker(true)}>+ Exercice</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSession}>Suppr.</Button>
        </div>
      </div>

      {/* Liste des exercices de la séance */}
      {session.session_exercises.length > 0 ? (
        <div className="space-y-2">
          {session.session_exercises
            .sort((a, b) => a.order_index - b.order_index)
            .map((se) => (
              <div key={se.id} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{se.exercise.name}</p>
                  <p className="text-xs text-gray-500">
                    {se.sets}x{se.reps} • repos {se.rest_seconds}s
                    {se.coach_notes && ` • ${se.coach_notes}`}
                  </p>
                </div>
                <button onClick={() => handleRemoveExercise(se.id)} className="text-red-400 hover:text-red-600 text-sm">
                  ✕
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Aucun exercice dans cette séance</p>
      )}

      {/* Modal de sélection d'exercice */}
      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onPick={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
