'use client'

// Éditeur d'une séance : nom, programme, exercices avec gestion complète
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

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

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

  const workoutAssigned = workouts.find(w => w.id === (session as any).workout_id)

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
      sets: editSets, reps: editReps, rest_seconds: editRest, coach_notes: editNotes,
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

  // Exercices du programme assigné
  const workoutExercises = (() => {
    if (!workoutAssigned || !workoutAssigned.workout_exercises?.length) return null
    const exclusions: string[] = ((session as any).session_excluded_exercises ?? []).map((e: any) => e.workout_exercise_id)
    const details: Record<string, { sets: string; reps: string }> = {}
    for (const d of ((session as any).session_exercise_details ?? [])) {
      details[d.workout_exercise_id] = { sets: d.sets, reps: d.reps }
    }
    return { sorted: [...workoutAssigned.workout_exercises].sort((a, b) => a.order_index - b.order_index), exclusions, details }
  })()

  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* En-tête séance */}
      {editingSession ? (
        <div className="p-4 space-y-3">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#555]"
            placeholder="Nom de la séance"
          />
          {workouts.length > 0 && (
            <select
              value={(session as any).workout_id ?? ''}
              onChange={async (e) => {
                await assignWorkoutToSession(session.id, e.target.value || null, clientId)
                router.refresh()
              }}
              className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
            >
              <option value="">— Aucun programme —</option>
              {workouts.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          )}
          <div>
            <p className="text-xs text-[#888] mb-2">Jour (optionnel)</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleEditDay(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                    editDays.includes(d) ? 'bg-[#d4ff00] text-black' : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={editDetails}
            onChange={(e) => setEditDetails(e.target.value)}
            rows={2}
            className="w-full px-3 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#555]"
            placeholder="Instructions, circuit, intervalles..."
          />
          <input
            value={editRecovery}
            onChange={(e) => setEditRecovery(e.target.value)}
            className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#555]"
            placeholder="Récupération : 30s entre exercices, 2' entre tours..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveSession} className="flex-1">Enregistrer</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditingSession(false)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Titre + badge programme + jour */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="w-7 h-7 rounded-lg bg-[#242424] text-[#d4ff00] flex items-center justify-center text-xs font-bold shrink-0">
                {sessionNumber}
              </span>
              <h4 className="font-bold text-white text-sm">{session.name}</h4>
              {workoutAssigned && (
                <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-[11px] px-2 py-0.5 rounded-full font-medium">
                  {workoutAssigned.name}
                </span>
              )}
            </div>
            {session.day_of_week && (
              <span className="text-xs text-[#666] shrink-0">{session.day_of_week}</span>
            )}
          </div>

          {/* Description + récupération */}
          {session.details && (
            <p className="text-xs text-[#999] whitespace-pre-line mt-1 ml-9">{session.details}</p>
          )}
          {session.recovery && (
            <p className="text-xs text-[#d4ff00]/60 mt-1 ml-9">Récup : {session.recovery}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-3 ml-9">
            <button onClick={() => setEditingSession(true)} className="text-[#d4ff00] hover:text-[#c2ee00] text-xs font-medium transition-colors min-h-[44px] flex items-center">Modifier</button>
            <button onClick={() => setShowWorkoutPicker(true)} className="text-[#888] hover:text-white text-xs transition-colors min-h-[44px] flex items-center">+ Programme</button>
            <button onClick={() => setShowPicker(true)} className="text-[#888] hover:text-white text-xs transition-colors min-h-[44px] flex items-center">+ Exercice</button>
            <button onClick={handleDeleteSession} className="text-[#555] hover:text-red-400 text-xs transition-colors min-h-[44px] flex items-center ml-auto" aria-label="Supprimer la séance">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Liste exercices du programme assigné */}
      {workoutExercises && (
        <div className="border-t border-[#2a2a2a]">
          {(() => {
            let visibleIndex = 0
            return workoutExercises.sorted.map((we) => {
              const ex = Array.isArray(we.exercise) ? we.exercise[0] : we.exercise
              const isExcluded = workoutExercises.exclusions.includes(we.id)
              const detail = workoutExercises.details[we.id]
              if (!isExcluded) visibleIndex++
              return (
                <div key={we.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#1a1a1a] last:border-b-0 ${isExcluded ? 'opacity-30' : ''}`}>
                  <span className="text-xs font-bold text-[#d4ff00] w-5 text-center shrink-0">
                    {isExcluded ? '—' : visibleIndex}
                  </span>
                  <p className={`text-sm flex-1 min-w-0 truncate ${isExcluded ? 'text-[#555] line-through' : 'text-white'}`}>
                    {ex?.name}
                  </p>
                  {!isExcluded && (
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        defaultValue={detail?.sets ?? ''}
                        placeholder="—"
                        onBlur={(e) => updateExerciseDetails(session.id, we.id, e.target.value, detail?.reps ?? '', clientId)}
                        className="w-8 px-1 py-1 bg-[#242424] border border-[#333] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                      />
                      <span className="text-[#555] text-xs">×</span>
                      <input
                        defaultValue={detail?.reps ?? ''}
                        placeholder="—"
                        onBlur={(e) => updateExerciseDetails(session.id, we.id, detail?.sets ?? '', e.target.value, clientId)}
                        className="w-10 px-1 py-1 bg-[#242424] border border-[#333] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                      />
                    </div>
                  )}
                  {isExcluded ? (
                    <button
                      onClick={async () => { await includeWorkoutExercise(session.id, we.id, clientId); router.refresh() }}
                      className="text-xs text-[#d4ff00] hover:text-[#c2ee00] shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      onClick={async () => { await excludeWorkoutExercise(session.id, we.id, clientId); router.refresh() }}
                      className="text-xs text-[#555] hover:text-red-400 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            })
          })()}
        </div>
      )}

      {/* Exercices individuels */}
      {session.session_exercises.length > 0 && (
        <div className={workoutExercises ? '' : 'border-t border-[#2a2a2a]'}>
          {[...session.session_exercises]
            .sort((a, b) => a.order_index - b.order_index)
            .map((se) => (
              <div key={se.id} className="px-4 py-3 border-b border-[#1a1a1a] last:border-b-0">
                {editingExerciseId === se.id ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">{se.exercise.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-[#888]">Séries</label>
                        <input type="number" value={editSets} onChange={(e) => setEditSets(Number(e.target.value))} min={1} className="w-full px-2 py-2 min-h-[44px] bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888]">Reps</label>
                        <input value={editReps} onChange={(e) => setEditReps(e.target.value)} className="w-full px-2 py-2 min-h-[44px] bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888]">Repos (s)</label>
                        <input type="number" value={editRest} onChange={(e) => setEditRest(Number(e.target.value))} min={0} step={15} className="w-full px-2 py-2 min-h-[44px] bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]" />
                      </div>
                    </div>
                    <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full px-3 py-2 min-h-[44px] bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#555]" placeholder="Consignes..." />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="flex-1">Enregistrer</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingExerciseId(null)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{se.exercise.name}</p>
                      <p className="text-xs text-[#888]">
                        {se.sets}×{se.reps} · repos {se.rest_seconds}s
                        {se.coach_notes && <span className="text-[#666]"> · {se.coach_notes}</span>}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEditing(se)} className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-2 min-h-[44px] flex items-center transition-colors">Modifier</button>
                      <button onClick={() => handleRemoveExercise(se.id)} className="text-[#555] hover:text-red-400 text-xs px-2 min-h-[44px] flex items-center transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Message vide si aucun exercice */}
      {!workoutExercises && session.session_exercises.length === 0 && (
        <div className="px-4 py-6 text-center border-t border-[#2a2a2a]">
          <p className="text-sm text-[#555]">Aucun exercice</p>
          <button
            onClick={() => setShowPicker(true)}
            className="text-xs text-[#d4ff00] hover:text-[#c2ee00] mt-1 transition-colors"
          >
            + Ajouter un exercice
          </button>
        </div>
      )}

      {/* Modals */}
      {showPicker && (
        <ExercisePicker exercises={exercises} onPick={handleAddExercise} onClose={() => setShowPicker(false)} />
      )}

      {showWorkoutPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowWorkoutPicker(false)}>
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-4 w-full max-w-sm max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-3">Assigner un programme</h3>
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
                    className={`w-full text-left px-3 py-3 min-h-[44px] rounded-xl transition-colors ${
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
