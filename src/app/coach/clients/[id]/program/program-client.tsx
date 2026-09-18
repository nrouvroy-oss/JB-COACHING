'use client'

// Wrapper client pour la page programme — gère la création d'un programme si absent
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgramEditor } from '@/components/coach/program-editor'
import { createProgram } from './actions'
import type { Profile, Exercise, ProgramWithWeeks } from '@/lib/types'

interface ProgramPageClientProps {
  client: Profile
  program: ProgramWithWeeks | null
  exercises: Exercise[]
}

export function ProgramPageClient({ client, program, exercises }: ProgramPageClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [programName, setProgramName] = useState('')
  const router = useRouter()

  async function handleCreate() {
    if (!programName.trim()) return
    await createProgram(client.id, programName)
    setProgramName('')
    setShowCreate(false)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête avec les informations du client */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
      </div>

      {/* Affiche l'éditeur ou le formulaire de création */}
      {program ? (
        <ProgramEditor program={program} exercises={exercises} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun programme actif pour ce client.</p>
          {showCreate ? (
            <div className="max-w-sm mx-auto space-y-3">
              <Input
                label="Nom du programme"
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Ex: Remise en forme - Septembre"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Créer</Button>
                <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowCreate(true)}>Créer un programme</Button>
          )}
        </div>
      )}
    </div>
  )
}
