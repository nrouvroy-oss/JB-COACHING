'use client'

// Wrapper client pour la page programme — création, duplication depuis un autre client
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgramEditor } from '@/components/coach/program-editor'
import { createProgram, duplicateProgram } from './actions'
import type { Profile, Exercise, ProgramWithWeeks } from '@/lib/types'

interface ExistingClientProgram {
  id: string
  name: string
  client_name: string
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

interface ArchivedProgram {
  id: string
  name: string
  created_at: string
  weeks: { id: string; week_number: number; sessions: { id: string }[] }[]
}

interface ProgramPageClientProps {
  client: Profile
  program: ProgramWithWeeks | null
  exercises: Exercise[]
  workouts?: WorkoutOption[]
  otherClientPrograms?: ExistingClientProgram[]
  archivedPrograms?: ArchivedProgram[]
}

export function ProgramPageClient({ client, program, exercises, workouts = [], otherClientPrograms = [], archivedPrograms = [] }: ProgramPageClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const [programName, setProgramName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    if (!programName.trim()) return
    setLoading(true)
    await createProgram(client.id, programName)
    setProgramName('')
    setShowCreate(false)
    setLoading(false)
    router.refresh()
  }

  async function handleCopy(sourceProgramId: string, sourceName: string) {
    const name = programName.trim() || sourceName
    setLoading(true)
    await duplicateProgram(sourceProgramId, client.id, name)
    setProgramName('')
    setShowCopy(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête avec les informations du client */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {(client.first_name && client.last_name)
              ? `${client.first_name} ${client.last_name}`
              : client.full_name}
          </h1>
          <p className="text-sm text-[#888]">{client.email}</p>
        </div>
        <Link
          href={`/coach/clients/${client.id}`}
          className="text-sm text-[#888] hover:text-[#d4ff00] font-medium transition-colors border border-[#2a2a2a] hover:border-[#d4ff00]/30 rounded-lg px-3 py-1.5"
        >
          Fiche client
        </Link>
      </div>

      {/* Affiche l'éditeur ou le formulaire de création */}
      {program ? (
        <>
          <ProgramEditor program={program} exercises={exercises} workouts={workouts} />
          {/* Bouton pour créer un nouveau plan (archive l'ancien) */}
          <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
            {showCreate ? (
              <div className="max-w-sm mx-auto space-y-3">
                <Input
                  label="Nom du nouveau plan"
                  id="new-plan-name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Ex: Force — Cycle 2"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={loading} className="flex-1">
                    {loading ? 'Création...' : 'Créer et archiver l\'ancien'}
                  </Button>
                  <Button variant="secondary" onClick={() => { setShowCreate(false); setProgramName('') }}>Annuler</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs text-[#888] hover:text-[#d4ff00] transition-colors"
              >
                + Nouveau plan (archive le plan actuel)
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#888] mb-4">Aucun plan actif pour ce client.</p>

          {showCreate ? (
            <div className="max-w-sm mx-auto space-y-3">
              <Input
                label="Nom du plan"
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Ex: Force — Cycle 1"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={loading} className="flex-1">
                  {loading ? 'Création...' : 'Créer'}
                </Button>
                <Button variant="secondary" onClick={() => { setShowCreate(false); setProgramName('') }}>Annuler</Button>
              </div>
            </div>
          ) : showCopy ? (
            <div className="max-w-sm mx-auto space-y-4 text-left">
              <Input
                label="Renommer (optionnel)"
                id="program-name-copy"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Laisse vide pour garder le même nom"
              />
              <p className="text-sm font-medium text-[#ccc]">Copier le plan de :</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {otherClientPrograms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleCopy(p.id, p.name)}
                    disabled={loading}
                    className="w-full text-left p-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#d4ff00]/30 hover:bg-[#d4ff00]/5 transition-all disabled:opacity-40"
                  >
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-[#888]">{p.client_name}</p>
                  </button>
                ))}
                {otherClientPrograms.length === 0 && (
                  <p className="text-sm text-[#777] text-center py-4">Aucun plan à copier</p>
                )}
              </div>
              <Button variant="secondary" onClick={() => { setShowCopy(false); setProgramName('') }} className="w-full">
                Annuler
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={() => setShowCreate(true)}>Créer un plan</Button>
              {otherClientPrograms.length > 0 && (
                <Button variant="secondary" onClick={() => setShowCopy(true)}>
                  Copier depuis un autre client
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plans archivés */}
      {archivedPrograms.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wide mb-3">Plans archivés</h2>
          <div className="space-y-2">
            {archivedPrograms.map((p) => {
              const totalSessions = p.weeks.reduce((acc, w) => acc + w.sessions.length, 0)
              return (
                <div key={p.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-[#888]">
                        {p.weeks.length} semaine{p.weeks.length > 1 ? 's' : ''} · {totalSessions} séance{totalSessions > 1 ? 's' : ''} · {new Date(p.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-xs text-[#555]">Terminé</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
