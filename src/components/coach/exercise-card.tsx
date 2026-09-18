'use client'

// Carte d'affichage d'un exercice avec aperçu vidéo et actions
import { VideoPlayer } from '@/components/ui/video-player'
import { Button } from '@/components/ui/button'
import type { Exercise } from '@/lib/types'

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (id: string) => void
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Aperçu vidéo si disponible */}
      {exercise.video_url && (
        <VideoPlayer url={exercise.video_url} className="rounded-none" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{exercise.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {exercise.category}
            </span>
          </div>
          <div className="flex gap-2">
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
          <p className="mt-2 text-sm text-gray-600">{exercise.description}</p>
        )}
      </div>
    </div>
  )
}
