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
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Laisser un commentaire
      </button>
    )
  }

  // Afficher le commentaire existant avec option de modification
  if (!editing && value) {
    return (
      <button onClick={() => setEditing(true)} className="text-sm text-gray-600 italic">
        &quot;{value}&quot; <span className="text-blue-600 ml-1">modifier</span>
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
        className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
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
