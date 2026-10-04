'use client'

// Liste des programmes réutilisables (Muscu 3, TRX, Vélo...)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { createWorkout, deleteWorkout } from './actions'

interface WorkoutItem {
  id: string
  name: string
  description: string
  workout_exercises: { id: string }[]
}

interface WorkoutsClientProps {
  workouts: WorkoutItem[]
}

export function WorkoutsClient({ workouts }: WorkoutsClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    const result = await createWorkout(name.trim())
    setLoading(false)
    if (!result.error && result.id) {
      setName('')
      setShowModal(false)
      router.push(`/coach/workouts/${result.id}`)
    }
  }

  async function handleDelete(id: string, workoutName: string) {
    if (!confirm(`Supprimer le programme "${workoutName}" ?`)) return
    await deleteWorkout(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>Programmes</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>+ Créer</Button>
      </div>
      <p className="text-sm text-[#888] mb-4">
        Blocs d&apos;exercices réutilisables à assigner aux séances.
      </p>

      {workouts.length === 0 ? (
        <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <p className="text-[#888] text-sm mb-4">Aucun programme pour le moment</p>
          <Button onClick={() => setShowModal(true)}>+ Créer mon premier programme</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <div key={w.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#333] transition-all overflow-hidden">
              <Link href={`/coach/workouts/${w.id}`} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{w.name}</p>
                  <p className="text-xs text-[#888]">
                    {w.workout_exercises.length} exercice{w.workout_exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="w-4 h-4 text-[#555] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="flex border-t border-[#242424]">
                <Link
                  href={`/coach/workouts/${w.id}`}
                  className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#d4ff00] hover:bg-[#242424] transition-colors"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(w.id, w.name)}
                  className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#555] hover:text-red-400 hover:bg-[#242424] transition-colors border-l border-[#242424]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nouveau programme" onClose={() => { setShowModal(false); setName('') }}>
          <div className="space-y-4">
            <Input
              label="Nom du programme"
              id="workout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Renforcement, TRX, Course..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading || !name.trim()} className="flex-1">
                {loading ? 'Création...' : 'Créer'}
              </Button>
              <Button variant="secondary" onClick={() => { setShowModal(false); setName('') }}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
