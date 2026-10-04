'use client'

// Éditeur principal du programme : liste les semaines et permet d'en ajouter
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WeekSection } from '@/components/coach/week-section'
import { addWeek, renameProgram, deleteProgram } from '@/app/coach/clients/[id]/program/actions'
import type { ProgramWithWeeks, Exercise } from '@/lib/types'

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

interface ProgramEditorProps {
  program: ProgramWithWeeks
  exercises: Exercise[]
  workouts?: WorkoutOption[]
}

export function ProgramEditor({ program, exercises, workouts = [] }: ProgramEditorProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(program.name)
  const router = useRouter()

  async function handleRename() {
    if (!editName.trim()) return
    await renameProgram(program.id, editName.trim(), program.client_id)
    setEditing(false)
    router.refresh()
  }

  async function handleAddWeek() {
    // Calcule le prochain numéro de semaine
    const nextNumber = program.weeks.length > 0
      ? Math.max(...program.weeks.map((w) => w.week_number)) + 1
      : 1
    await addWeek(program.id, nextNumber, program.client_id)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête programme */}
      <div className="mb-5">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
              autoFocus
            />
            <button onClick={handleRename} className="text-sm text-[#d4ff00] hover:text-[#c2ee00] min-h-[44px] px-3 font-medium">OK</button>
            <button onClick={() => { setEditing(false); setEditName(program.name) }} className="text-sm text-[#888] hover:text-white min-h-[44px] px-2">Annuler</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'Bricolage Grotesque' }}>{program.name}</h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setEditing(true)} className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors min-h-[44px] px-2 flex items-center">Renommer</button>
              <button
                onClick={async () => {
                  if (!confirm(`Supprimer le plan "${program.name}" et toutes ses données ?`)) return
                  await deleteProgram(program.id, program.client_id)
                  router.refresh()
                }}
                className="text-[#555] hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Supprimer le plan"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {[...program.weeks]
          .sort((a, b) => a.week_number - b.week_number)
          .map((week) => (
            <WeekSection
              key={week.id}
              week={week}
              exercises={exercises}
              clientId={program.client_id}
              workouts={workouts}
            />
          ))}
      </div>

      <Button onClick={handleAddWeek} variant="secondary" className="w-full mt-4">
        + Ajouter une semaine
      </Button>
    </div>
  )
}
