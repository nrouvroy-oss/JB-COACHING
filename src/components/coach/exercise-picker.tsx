'use client'

// Modal pour choisir un exercice de la bibliothèque et configurer ses paramètres
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Exercise } from '@/lib/types'

interface ExercisePickerProps {
  exercises: Exercise[]
  onPick: (exerciseId: string, sets: number, reps: string, restSeconds: number, coachNotes: string, durationSeconds: number | null) => void
  onClose: () => void
}

export function ExercisePicker({ exercises, onPick, onClose }: ExercisePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState('10')
  const [restSeconds, setRestSeconds] = useState(60)
  const [coachNotes, setCoachNotes] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('')
  const [search, setSearch] = useState('')

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const selected = exercises.find((e) => e.id === selectedId)

  // Formulaire de configuration de l'exercice sélectionné
  if (selected) {
    return (
      <Modal title={`Ajouter : ${selected.name}`} onClose={onClose}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Séries" id="sets" type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} min={1} />
            <Input label="Répétitions" id="reps" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10 ou 8-12" />
            <Input label="Repos (sec)" id="rest" type="number" value={restSeconds} onChange={(e) => setRestSeconds(Number(e.target.value))} min={0} step={15} />
            <Input label="Durée (sec)" id="duration" type="number" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} min={0} step={5} placeholder="Optionnel" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Notes du coach</label>
            <textarea
              id="notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors"
              placeholder="Garde le dos droit, contrôle la descente..."
            />
          </div>
          <Button className="w-full" onClick={() => { onPick(selected.id, sets, reps, restSeconds, coachNotes, durationSeconds ? parseInt(durationSeconds) : null); onClose() }}>
            Ajouter à la séance
          </Button>
        </div>
      </Modal>
    )
  }

  // Liste des exercices avec recherche
  return (
    <Modal title="Choisir un exercice" onClose={onClose}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un exercice..."
        className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg mb-3 focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors"
      />
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setSelectedId(exercise.id)}
            className="w-full text-left p-3 bg-[#242424] rounded-xl hover:bg-[#d4ff00]/5 transition-colors border border-[#2a2a2a] hover:border-[#d4ff00]/30"
          >
            <p className="font-medium text-white">{exercise.name}</p>
            <span className="text-xs text-[#d4ff00]">{exercise.category}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-[#777] text-center py-4">Aucun exercice trouvé</p>
        )}
      </div>
    </Modal>
  )
}
