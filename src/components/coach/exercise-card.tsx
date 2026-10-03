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
  onDuplicate?: (exercise: Exercise) => void
}

export function ExerciseCard({ exercise, onEdit, onDelete, onDuplicate }: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false)
  const isStandard = exercise.coach_id === null

  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] overflow-hidden transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{exercise.name}</h3>
              {isStandard && (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded font-medium shrink-0">
                  Base
                </span>
              )}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#d4ff00]/10 text-[#d4ff00] text-xs rounded-full">
              {exercise.category}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {exercise.video_url && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="text-[#d4ff00] hover:text-[#c2ee00] text-xs px-3 py-2 min-h-[44px] flex items-center transition-colors"
              >
                {showVideo ? 'Masquer' : '▶ Voir'}
              </button>
            )}
            {isStandard ? (
              onDuplicate && (
                <Button variant="secondary" size="sm" onClick={() => onDuplicate(exercise)}>
                  Dupliquer
                </Button>
              )
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => onEdit(exercise)}>
                  Modifier
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(exercise.id)}>
                  Suppr.
                </Button>
              </>
            )}
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
