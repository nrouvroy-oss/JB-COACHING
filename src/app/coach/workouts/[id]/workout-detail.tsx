'use client'

// Détail d'un programme — liste des exercices avec ajout/suppression
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { renameWorkout } from '../actions'
import { addExerciseToWorkout, removeExerciseFromWorkout, updateWorkoutExercise } from './actions'
import type { Exercise } from '@/lib/types'

interface WorkoutExerciseItem {
  id: string
  exercise_id: string
  order_index: number
  coach_notes: string
  exercise: Exercise
}

interface WorkoutData {
  id: string
  name: string
  description: string
  workout_exercises: WorkoutExerciseItem[]
}

interface WorkoutDetailProps {
  workout: WorkoutData
  exercises: Exercise[]
}

export function WorkoutDetail({ workout, exercises }: WorkoutDetailProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(workout.name)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const router = useRouter()

  // Exercices triés par ordre
  const sortedExercises = [...workout.workout_exercises].sort((a, b) => a.order_index - b.order_index)

  // Exercices pas encore dans le programme
  const availableExercises = exercises.filter(
    (e) => !workout.workout_exercises.some((we) => we.exercise_id === e.id)
  )
  const filteredExercises = availableExercises.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddExercise(exerciseId: string) {
    await addExerciseToWorkout(workout.id, exerciseId, '')
    router.refresh()
  }

  async function handleRemoveExercise(weId: string) {
    await removeExerciseFromWorkout(weId, workout.id)
    router.refresh()
  }

  async function handleRename() {
    if (!nameValue.trim()) return
    await renameWorkout(workout.id, nameValue.trim())
    setEditingName(false)
    router.refresh()
  }

  async function handleSaveNote() {
    if (!editingNoteId) return
    await updateWorkoutExercise(editingNoteId, noteValue, workout.id)
    setEditingNoteId(null)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête avec retour */}
      <Link
        href="/coach/workouts"
        className="text-sm text-[#888] hover:text-[#d4ff00] font-medium transition-colors border border-[#2a2a2a] hover:border-[#d4ff00]/30 rounded-lg px-3 py-1.5 inline-block mb-4"
      >
        ← Retour
      </Link>

      {/* Nom du programme (éditable) */}
      <div className="flex items-center gap-2 mb-6">
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-3 py-1.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
              autoFocus
            />
            <button onClick={handleRename} className="text-xs text-[#d4ff00]">OK</button>
            <button onClick={() => { setEditingName(false); setNameValue(workout.name) }} className="text-xs text-[#888]">Annuler</button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
            <button onClick={() => setEditingName(true)} className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors">Renommer</button>
          </>
        )}
      </div>

      {/* Liste des exercices du programme */}
      {sortedExercises.length > 0 ? (
        <div className="space-y-2 mb-4">
          {sortedExercises.map((we, index) => (
            <div key={we.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3">
              {editingNoteId === we.id ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">{index + 1}. {we.exercise.name}</p>
                  <input
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                    className="w-full px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777]"
                    placeholder="Notes pour cet exercice..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNote}>OK</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingNoteId(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{index + 1}. {we.exercise.name}</p>
                    {we.exercise.category && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#d4ff00]/10 text-[#d4ff00] text-xs rounded-full">{we.exercise.category}</span>
                    )}
                    {we.coach_notes && (
                      <p className="text-xs text-[#888] mt-0.5">{we.coach_notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingNoteId(we.id); setNoteValue(we.coach_notes) }}
                      className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-2 py-1 transition-colors"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => handleRemoveExercise(we.id)}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#777] italic mb-4">Aucun exercice dans ce programme. Ajoute-en ci-dessous.</p>
      )}

      <Button onClick={() => setShowPicker(true)} variant="secondary" className="w-full">
        + Ajouter un exercice
      </Button>

      {/* Modal de sélection d'exercice (simple) */}
      {showPicker && (
        <Modal title="Ajouter un exercice" onClose={() => { setShowPicker(false); setSearch('') }}>
          <div className="space-y-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777]"
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredExercises.length === 0 ? (
                <p className="text-sm text-[#777] text-center py-4">
                  {availableExercises.length === 0 ? 'Tous les exercices sont déjà ajoutés' : 'Aucun résultat'}
                </p>
              ) : (
                filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { handleAddExercise(ex.id); setShowPicker(false); setSearch('') }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#242424] transition-colors"
                  >
                    <p className="text-sm text-white">{ex.name}</p>
                    <p className="text-xs text-[#888]">{ex.category}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
