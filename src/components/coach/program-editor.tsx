'use client'

// Éditeur principal du programme : liste les semaines et permet d'en ajouter
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WeekSection } from '@/components/coach/week-section'
import { addWeek } from '@/app/coach/clients/[id]/program/actions'
import type { ProgramWithWeeks, Exercise } from '@/lib/types'

interface ProgramEditorProps {
  program: ProgramWithWeeks
  exercises: Exercise[]
}

export function ProgramEditor({ program, exercises }: ProgramEditorProps) {
  const router = useRouter()

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
        <h2 className="text-lg font-bold text-gray-900">{program.name}</h2>
        <p className="text-sm text-gray-500">Programme de {program.client.full_name}</p>
      </div>

      <div className="space-y-4">
        {program.weeks
          .sort((a, b) => a.week_number - b.week_number)
          .map((week) => (
            <WeekSection
              key={week.id}
              week={week}
              exercises={exercises}
              clientId={program.client_id}
            />
          ))}
      </div>

      <Button onClick={handleAddWeek} variant="secondary" className="w-full mt-4">
        + Ajouter une semaine
      </Button>
    </div>
  )
}
