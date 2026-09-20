'use client'

// Éditeur de séance pour les modèles — identique à SessionEditor mais utilise les actions de modèle
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExercisePicker } from '@/components/coach/exercise-picker'
import {
  deleteSessionFromTemplate,
  updateSessionInTemplate,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
  updateTemplateExercise,
  assignWorkoutToTemplateSession,
} from '@/app/coach/programs/[id]/actions'
import type { SessionWithExercises, Exercise } from '@/lib/types'

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

interface TemplateSessionEditorProps {
  session: SessionWithExercises
  sessionNumber?: number
  exercises: Exercise[]
  programId: string
  workouts?: WorkoutOption[]
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function TemplateSessionEditor({ session, sessionNumber, exercises, programId, workouts = [] }: TemplateSessionEditorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false)
  const [editingSession, setEditingSession] = useState(false)
  const [editName, setEditName] = useState(session.name)
  const [editDays, setEditDays] = useState<string[]>(session.day_of_week ? session.day_of_week.split(', ').filter(Boolean) : [])
  const [editDetails, setEditDetails] = useState(session.details ?? '')
  const [editRecovery, setEditRecovery] = useState(session.recovery ?? '')
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)
  const [editSets, setEditSets] = useState(0)
  const [editReps, setEditReps] = useState('')
  const [editRest, setEditRest] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  const router = useRouter()

  async function handleAddExercise(exerciseId: string, sets: number, reps: string, restSeconds: number, coachNotes: string, durationSeconds: number | null) {
    await addExerciseToTemplate(session.id, exerciseId, sets, reps, restSeconds, coachNotes, programId, durationSeconds)
    router.refresh()
  }

  async function handleRemoveExercise(sessionExerciseId: string) {
    await removeExerciseFromTemplate(sessionExerciseId, programId)
    router.refresh()
  }

  function startEditing(se: any) {
    setEditingExerciseId(se.id)
    setEditSets(se.sets)
    setEditReps(se.reps)
    setEditRest(se.rest_seconds)
    setEditNotes(se.coach_notes)
  }

  async function handleSaveEdit() {
    if (!editingExerciseId) return
    await updateTemplateExercise(editingExerciseId, {
      sets: editSets,
      reps: editReps,
      rest_seconds: editRest,
      coach_notes: editNotes,
    }, programId)
    setEditingExerciseId(null)
    router.refresh()
  }

  function toggleEditDay(day: string) {
    setEditDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  async function handleSaveSession() {
    if (!editName.trim()) return
    await updateSessionInTemplate(session.id, editName, editDays.join(', '), programId, editDetails, editRecovery)
    setEditingSession(false)
    router.refresh()
  }

  async function handleDeleteSession() {
    if (!confirm(`Supprimer la séance "${session.name}" ?`)) return
    await deleteSessionFromTemplate(session.id, programId)
    router.refresh()
  }

  return (
    <div className="bg-[#242424] rounded-xl p-4 border border-[#2a2a2a]">
      {editingSession ? (
        <div className="space-y-2 mb-3">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] placeholder:text-[#777]"
            placeholder="Nom de la séance"
          />
          {/* Sélecteur de programme (Muscu 3, TRX...) */}
          {workouts.length > 0 && (
            <div>
              <label className="text-xs text-[#888]">Programme associé</label>
              <select
                value={(session as any).workout_id ?? ''}
                onChange={async (e) => {
                  const val = e.target.value || null
                  await assignWorkoutToTemplateSession(session.id, val, programId)
                  router.refresh()
                }}
                className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
              >
                <option value="">— Aucun programme —</option>
                {workouts.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <p className="text-xs text-[#888]">Jour suggéré (optionnel) :</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleEditDay(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  editDays.includes(d) ? 'bg-[#d4ff00] text-black' : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-[#888]">Détails (instructions, circuit, intervalles...)</label>
            <textarea
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777]"
              placeholder="Ex: 5x(10 pompes, 10 tractions), 4x(7' course/1' marche)..."
            />
          </div>
          <div>
            <label className="text-xs text-[#888]">Récupération</label>
            <input
              value={editRecovery}
              onChange={(e) => setEditRecovery(e.target.value)}
              className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777]"
              placeholder="Ex: 30s entre exercices, 2' entre tours..."
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveSession}>Enregistrer</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditingSession(false)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <span className="font-semibold text-white">
              {session.name}
            </span>
            {(session as any).workout_id && workouts.length > 0 && (
              <span className="ml-2 inline-block bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                {workouts.find(w => w.id === (session as any).workout_id)?.name ?? 'Programme'}
              </span>
            )}
            {session.day_of_week && (
              <span className="ml-2 text-xs text-[#777] italic">({session.day_of_week})</span>
            )}
            {session.details && (
              <p className="text-xs text-[#aaa] mt-0.5 whitespace-pre-line">{session.details}</p>
            )}
            {session.recovery && (
              <p className="text-xs text-[#d4ff00]/70 mt-0.5">Récup : {session.recovery}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditingSession(true)} className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-2 py-1 transition-colors">Modifier</button>
            <Button size="sm" variant="secondary" onClick={() => setShowWorkoutPicker(true)}>+ Programme</Button>
            <Button size="sm" variant="danger" onClick={handleDeleteSession}>Suppr.</Button>
          </div>
        </div>
      )}

      {/* Exercices du programme assigné */}
      {(() => {
        const workout = workouts.find(w => w.id === (session as any).workout_id)
        if (!workout || !workout.workout_exercises?.length) return null
        const sorted = [...workout.workout_exercises].sort((a, b) => a.order_index - b.order_index)
        return (
          <div className="mb-2">
            <div className="grid gap-1.5">
              {sorted.map((we, i) => (
                <div key={we.id} className="flex items-center gap-2 bg-[#1c1c1c]/60 px-3 py-2 rounded-lg">
                  <span className="text-xs font-bold text-[#d4ff00] w-5 shrink-0">{i + 1}</span>
                  {(() => {
                    const ex = Array.isArray(we.exercise) ? we.exercise[0] : we.exercise
                    return (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{ex?.name}</p>
                          {we.coach_notes && <p className="text-xs text-[#777] truncate">{we.coach_notes}</p>}
                        </div>
                        <span className="text-xs text-[#555] shrink-0">{ex?.category}</span>
                      </>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Exercices individuels de la séance */}
      {session.session_exercises.length > 0 ? (
        <div className="space-y-2">
          {[...session.session_exercises]
            .sort((a, b) => a.order_index - b.order_index)
            .map((se) => (
              <div key={se.id} className="bg-[#1c1c1c] p-3 rounded-xl border border-[#2a2a2a]">
                {editingExerciseId === se.id ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">{se.exercise.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-[#888]">Séries</label>
                        <input type="number" value={editSets} onChange={(e) => setEditSets(Number(e.target.value))} min={1} className="w-full px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888]">Reps</label>
                        <input value={editReps} onChange={(e) => setEditReps(e.target.value)} className="w-full px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888]">Repos (s)</label>
                        <input type="number" value={editRest} onChange={(e) => setEditRest(Number(e.target.value))} min={0} step={15} className="w-full px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#888]">Notes</label>
                      <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777]" placeholder="Consignes..." />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>Enregistrer</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingExerciseId(null)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{se.exercise.name}</p>
                      <p className="text-xs text-[#888]">
                        {se.sets}x{se.reps} • repos {se.rest_seconds}s
                        {se.coach_notes && ` • ${se.coach_notes}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditing(se)} className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-2 py-1 transition-colors">Modifier</button>
                      <button onClick={() => handleRemoveExercise(se.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-colors">Suppr.</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-[#777] italic">Aucun exercice dans cette séance</p>
      )}

      {/* Modal de sélection d'exercice */}
      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onPick={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Modal de sélection de programme */}
      {showWorkoutPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowWorkoutPicker(false)}>
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4 w-full max-w-sm max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white mb-3">Assigner un programme</h3>
            {workouts.length === 0 ? (
              <p className="text-sm text-[#777] text-center py-4">Aucun programme créé</p>
            ) : (
              <div className="space-y-1">
                {workouts.map((w) => (
                  <button
                    key={w.id}
                    onClick={async () => {
                      await assignWorkoutToTemplateSession(session.id, w.id, programId)
                      setShowWorkoutPicker(false)
                      router.refresh()
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      (session as any).workout_id === w.id
                        ? 'bg-[#d4ff00]/10 text-[#d4ff00]'
                        : 'hover:bg-[#242424] text-white'
                    }`}
                  >
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-xs text-[#888]">{w.workout_exercises?.length ?? 0} exercice{(w.workout_exercises?.length ?? 0) > 1 ? 's' : ''}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
