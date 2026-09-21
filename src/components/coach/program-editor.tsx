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
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="flex-1 px-3 py-1.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                autoFocus
              />
              <button onClick={handleRename} className="text-xs text-[#d4ff00] hover:text-[#c2ee00]">OK</button>
              <button onClick={() => { setEditing(false); setEditName(program.name) }} className="text-xs text-[#888] hover:text-white">Annuler</button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">{program.name}</h2>
              <button onClick={() => setEditing(true)} className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors">Renommer</button>
              <button
                onClick={async () => {
                  if (!confirm(`Supprimer le programme "${program.name}" et toutes ses données ?`)) return
                  await deleteProgram(program.id, program.client_id)
                  router.refresh()
                }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
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
