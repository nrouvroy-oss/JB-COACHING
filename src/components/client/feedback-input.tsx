'use client'

// Composant champ de commentaire inline pour les exercices
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FeedbackInputProps {
  initialValue: string
  onSubmit: (feedback: string) => void
}

export function FeedbackInput({ initialValue, onSubmit }: FeedbackInputProps) {
  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)

  // Afficher le bouton "laisser un commentaire" si pas de valeur et pas en édition
  if (!editing && !value) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-[#d4ff00] hover:text-[#c2ee00] transition-colors"
      >
        + Laisser un commentaire
      </button>
    )
  }

  // Afficher le commentaire existant avec option de modification
  if (!editing && value) {
    return (
      <button onClick={() => setEditing(true)} className="text-sm text-[#888] italic">
        &quot;{value}&quot; <span className="text-[#d4ff00] ml-1">modifier</span>
      </button>
    )
  }

  // Mode édition avec champ texte et bouton valider
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Trop facile, douleur au genou..."
        className="flex-1 px-3 py-1.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] placeholder:text-[#777]"
        autoFocus
      />
      <Button
        size="sm"
        onClick={() => { onSubmit(value); setEditing(false) }}
      >
        OK
      </Button>
    </div>
  )
}
