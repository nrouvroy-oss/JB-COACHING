'use client'

// Composant client — liste et création des programmes (Muscu 3, TRX, Vélo...)
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
      // Aller directement sur la page du programme pour ajouter des exercices
      router.push(`/coach/workouts/${result.id}`)
    }
  }

  async function handleDelete(id: string, workoutName: string) {
    if (!confirm(`Supprimer le programme "${workoutName}" ?`)) return
    await deleteWorkout(id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Programmes</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>+ Créer</Button>
      </div>

      <p className="text-sm text-[#888]">
        Crée tes programmes (Muscu 3, TRX, Vélo...) puis assigne-les aux séances de tes clients.
      </p>

      {workouts.length === 0 ? (
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-8 text-center">
          <p className="text-[#888] text-sm mb-4">Aucun programme pour le moment.</p>
          <Button onClick={() => setShowModal(true)}>+ Créer mon premier programme</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] p-4 transition-all duration-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{w.name}</p>
                  <p className="text-xs text-[#888] mt-0.5">
                    {w.workout_exercises.length} exercice{w.workout_exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/coach/workouts/${w.id}`}
                    className="text-sm text-[#d4ff00] hover:text-[#c2ee00] font-medium transition-colors"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
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
              placeholder="Ex: Muscu 3, TRX, Course..."
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
