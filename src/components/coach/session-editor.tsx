'use client'

// Éditeur d'une séance : affiche les exercices, permet d'en ajouter/supprimer
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExercisePicker } from '@/components/coach/exercise-picker'
import { deleteSession, updateSession, addExerciseToSession, removeExerciseFromSession, updateSessionExercise, assignWorkoutToSession, excludeWorkoutExercise, includeWorkoutExercise, updateExerciseDetails } from '@/app/coach/clients/[id]/program/actions'
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

interface SessionEditorProps {
  session: SessionWithExercises
  sessionNumber?: number
  exercises: Exercise[]
  clientId: string
  workouts?: WorkoutOption[]
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function SessionEditor({ session, sessionNumber, exercises, clientId, workouts = [] }: SessionEditorProps) {
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
    await addExerciseToSession(session.id, exerciseId, sets, reps, restSeconds, coachNotes, clientId, durationSeconds)
    router.refresh()
  }

  async function handleRemoveExercise(sessionExerciseId: string) {
    await removeExerciseFromSession(sessionExerciseId, clientId)
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
    await updateSessionExercise(editingExerciseId, {
      sets: editSets,
      reps: editReps,
      rest_seconds: editRest,
      coach_notes: editNotes,
    }, clientId)
    setEditingExerciseId(null)
    router.refresh()
  }

  function toggleEditDay(day: string) {
    setEditDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  async function handleSaveSession() {
    if (!editName.trim()) return
    await updateSession(session.id, editName, editDays.join(', '), clientId, editDetails, editRecovery)
    setEditingSession(false)
    router.refresh()
  }

  async function handleDeleteSession() {
    if (!confirm(`Supprimer la séance "${session.name}" ?`)) return
    await deleteSession(session.id, clientId)
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
                  await assignWorkoutToSession(session.id, val, clientId)
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
        <div className="mb-2 space-y-2">
          {/* Ligne 1 : nom + badge programme */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{session.name}</span>
            {(session as any).workout_id && workouts.length > 0 && (
              <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                {workouts.find(w => w.id === (session as any).workout_id)?.name ?? 'Programme'}
              </span>
            )}
            {session.day_of_week && (
              <span className="text-xs text-[#777] italic">({session.day_of_week})</span>
            )}
          </div>
          {/* Ligne 2 : description + récupération */}
          {session.details && (
            <p className="text-xs text-[#aaa] whitespace-pre-line">{session.details}</p>
          )}
          {session.recovery && (
            <p className="text-xs text-[#d4ff00]/70">Récup : {session.recovery}</p>
          )}
          {/* Ligne 3 : boutons d'action */}
          <div className="flex gap-2">
            <button onClick={() => setEditingSession(true)} className="text-[#d4ff00] hover:text-[#c2ee00] text-xs transition-colors">Modifier</button>
            <button onClick={() => setShowWorkoutPicker(true)} className="text-[#888] hover:text-white text-xs transition-colors">+ Programme</button>
            <button onClick={handleDeleteSession} className="text-red-400 hover:text-red-300 text-xs transition-colors">Suppr.</button>
          </div>
        </div>
      )}

      {/* Exercices du programme assigné — personnalisables par séance */}
      {(() => {
        const workout = workouts.find(w => w.id === (session as any).workout_id)
        if (!workout || !workout.workout_exercises?.length) return null
        const exclusions: string[] = ((session as any).session_excluded_exercises ?? []).map((e: any) => e.workout_exercise_id)
        const details: Record<string, { sets: string; reps: string }> = {}
        for (const d of ((session as any).session_exercise_details ?? [])) {
          details[d.workout_exercise_id] = { sets: d.sets, reps: d.reps }
        }
        const sorted = [...workout.workout_exercises].sort((a, b) => a.order_index - b.order_index)
        let visibleIndex = 0
        return (
          <div className="mb-2">
            <div className="grid gap-1.5">
              {sorted.map((we) => {
                const ex = Array.isArray(we.exercise) ? we.exercise[0] : we.exercise
                const isExcluded = exclusions.includes(we.id)
                const detail = details[we.id]
                if (!isExcluded) visibleIndex++
                return (
                  <div key={we.id} className={`px-3 py-2 rounded-lg ${isExcluded ? 'bg-[#1c1c1c]/30 opacity-40' : 'bg-[#1c1c1c]/60'}`}>
                    {/* Ligne 1 : numéro + nom + bouton ✕ */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#d4ff00] w-5 shrink-0">{isExcluded ? '—' : visibleIndex}</span>
                      <p className={`text-sm flex-1 min-w-0 truncate ${isExcluded ? 'text-[#555] line-through' : 'text-white'}`}>{ex?.name}</p>
                      {isExcluded ? (
                        <button
                          onClick={async () => { await includeWorkoutExercise(session.id, we.id, clientId); router.refresh() }}
                          className="text-xs text-[#d4ff00] hover:text-[#c2ee00] shrink-0"
                        >
                          Rétablir
                        </button>
                      ) : (
                        <button
                          onClick={async () => { await excludeWorkoutExercise(session.id, we.id, clientId); router.refresh() }}
                          className="text-xs text-[#555] hover:text-red-400 shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Ligne 2 : séries x reps */}
                    {!isExcluded && (
                      <div className="flex items-center gap-1.5 ml-7 mt-1.5">
                        <span className="text-xs text-[#888]">Séries</span>
                        <input
                          defaultValue={detail?.sets ?? ''}
                          placeholder="—"
                          onBlur={(e) => updateExerciseDetails(session.id, we.id, e.target.value, detail?.reps ?? '', clientId)}
                          className="w-10 px-1.5 py-0.5 bg-[#242424] border border-[#2a2a2a] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                        />
                        <span className="text-xs text-[#555]">x</span>
                        <span className="text-xs text-[#888]">Reps</span>
                        <input
                          defaultValue={detail?.reps ?? ''}
                          placeholder="—"
                          onBlur={(e) => updateExerciseDetails(session.id, we.id, detail?.sets ?? '', e.target.value, clientId)}
                          className="w-12 px-1.5 py-0.5 bg-[#242424] border border-[#2a2a2a] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                        />
                      </div>
                    )}
                    {we.coach_notes && !isExcluded && <p className="text-xs text-[#777] mt-0.5 ml-7">{we.coach_notes}</p>}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="text-xs text-[#888] hover:text-[#d4ff00] mt-2 transition-colors"
            >
              + Ajouter un exercice
            </button>
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
                      await assignWorkoutToSession(session.id, w.id, clientId)
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
