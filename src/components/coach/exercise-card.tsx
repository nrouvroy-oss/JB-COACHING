'use client'

// Carte d'affichage d'un exercice avec aperçu média et actions
import { useState } from 'react'
import { MediaViewer } from '@/components/ui/media-viewer'
import { Button } from '@/components/ui/button'
import type { Exercise } from '@/lib/types'

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (id: string) => void
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] overflow-hidden transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-white">{exercise.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#d4ff00]/10 text-[#d4ff00] text-xs rounded-full">
              {exercise.category}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {exercise.video_url && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-2 py-1 transition-colors"
              >
                {showVideo ? 'Masquer' : '▶ Voir'}
              </button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onEdit(exercise)}>
              Modifier
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(exercise.id)}>
              Suppr.
            </Button>
          </div>
        </div>
        {/* Description de l'exercice */}
        {exercise.description && (
          <p className="mt-2 text-sm text-[#888]">{exercise.description}</p>
        )}
      </div>
      {/* Média masqué par défaut, affiché au clic */}
      {showVideo && exercise.video_url && (
        <div className="px-4 pb-4">
          <MediaViewer url={exercise.video_url} />
        </div>
      )}
    </div>
  )
}
