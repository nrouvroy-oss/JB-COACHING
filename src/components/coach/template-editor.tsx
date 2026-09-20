'use client'

// Éditeur principal pour les modèles de programmes — miroir de ProgramEditor mais sans client
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TemplateWeekSection } from '@/components/coach/template-week-section'
import { addWeekToTemplate } from '@/app/coach/programs/[id]/actions'
import { renameTemplate } from '@/app/coach/programs/actions'
import type { WeekWithSessions, Exercise } from '@/lib/types'

// Type d'un modèle de programme (pas de client associé)
interface TemplateProgram {
  id: string
  name: string
  coach_id: string
  status: string
  created_at: string
  weeks: WeekWithSessions[]
}

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

interface TemplateEditorProps {
  program: TemplateProgram
  exercises: Exercise[]
  workouts?: WorkoutOption[]
}

export function TemplateEditor({ program, exercises, workouts = [] }: TemplateEditorProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(program.name)
  const router = useRouter()

  async function handleRename() {
    if (!editName.trim()) return
    await renameTemplate(program.id, editName.trim())
    setEditing(false)
    router.refresh()
  }

  async function handleAddWeek() {
    // Calcule le prochain numéro de semaine
    const nextNumber = program.weeks.length > 0
      ? Math.max(...program.weeks.map((w) => w.week_number)) + 1
      : 1
    await addWeekToTemplate(program.id, nextNumber)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête du modèle avec badge et lien retour */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/coach/programs"
          className="text-sm text-[#888] hover:text-[#d4ff00] font-medium transition-colors border border-[#2a2a2a] hover:border-[#d4ff00]/30 rounded-lg px-3 py-1.5"
        >
          ← Retour
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
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
              <h1 className="text-2xl font-bold text-white">{program.name}</h1>
              <button onClick={() => setEditing(true)} className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors">Renommer</button>
            </>
          )}
          <span className="bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
            Modèle
          </span>
        </div>
        <p className="text-sm text-[#888]">
          {program.weeks.length} semaine{program.weeks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des semaines */}
      <div className="space-y-4">
        {[...program.weeks]
          .sort((a, b) => a.week_number - b.week_number)
          .map((week) => (
            <TemplateWeekSection
              key={week.id}
              week={week}
              exercises={exercises}
              programId={program.id}
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
