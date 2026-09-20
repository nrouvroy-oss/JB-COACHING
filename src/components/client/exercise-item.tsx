'use client'

// Composant exercice : affichage, case à cocher et feedback inline
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MediaViewer } from '@/components/ui/media-viewer'
import { FeedbackInput } from '@/components/client/feedback-input'
import { toggleExercise, submitFeedback } from '@/app/client/actions'
import type { SessionExerciseWithDetails } from '@/lib/types'

interface ExerciseItemProps {
  sessionExercise: SessionExerciseWithDetails
  clientId: string
}

export function ExerciseItem({ sessionExercise, clientId }: ExerciseItemProps) {
  const [showVideo, setShowVideo] = useState(false)
  const router = useRouter()
  const { exercise, exercise_log } = sessionExercise
  const isCompleted = exercise_log?.completed ?? false

  // Basculer l'état complété de l'exercice
  async function handleToggle() {
    await toggleExercise(sessionExercise.id, clientId, !isCompleted)
    router.refresh()
  }

  // Enregistrer le commentaire du client
  async function handleFeedback(feedback: string) {
    await submitFeedback(sessionExercise.id, clientId, feedback)
    router.refresh()
  }

  return (
    <div className={`rounded-xl border p-4 ${isCompleted ? 'border-green-500/20 bg-green-500/10' : 'bg-[#1c1c1c] border-[#2a2a2a]'}`}>
      <div className="flex items-start gap-3">
        {/* Case à cocher ronde */}
        <button
          onClick={handleToggle}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-[#444] hover:border-[#d4ff00]'
          }`}
        >
          {isCompleted && '✓'}
        </button>

        <div className="flex-1">
          {/* Nom de l'exercice et détails (séries × répétitions • repos) */}
          <h3 className={`font-medium ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
            {exercise.name}
          </h3>
          <p className="text-sm text-[#888] mt-0.5">
            {sessionExercise.duration_seconds
              ? `${sessionExercise.sets}x${sessionExercise.duration_seconds}s`
              : `${sessionExercise.sets}x${sessionExercise.reps}`}
            {sessionExercise.rest_seconds > 0 && ` • repos ${sessionExercise.rest_seconds}s`}
          </p>

          {/* Notes du coach si présentes */}
          {sessionExercise.coach_notes && (
            <p className="text-sm text-[#d4ff00] mt-1">
              💡 {sessionExercise.coach_notes}
            </p>
          )}

          {/* Bouton pour afficher/masquer le média */}
          {exercise.video_url && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="text-sm text-[#d4ff00] hover:text-[#c2ee00] mt-2 transition-colors"
            >
              {showVideo ? 'Masquer' : '▶ Voir la démo'}
            </button>
          )}

          {/* Média inline (vidéo, image ou PDF) */}
          {showVideo && exercise.video_url && (
            <div className="mt-2">
              <MediaViewer url={exercise.video_url} />
            </div>
          )}

          {/* Zone commentaire client */}
          <div className="mt-2">
            <FeedbackInput
              initialValue={exercise_log?.feedback ?? ''}
              onSubmit={handleFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
