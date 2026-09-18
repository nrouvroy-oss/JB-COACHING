'use client'

// Composant exercice : affichage, case à cocher et feedback inline
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoPlayer } from '@/components/ui/video-player'
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
    <div className={`bg-white rounded-xl border p-4 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        {/* Case à cocher ronde */}
        <button
          onClick={handleToggle}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {isCompleted && '✓'}
        </button>

        <div className="flex-1">
          {/* Nom de l'exercice et détails (séries × répétitions • repos) */}
          <h3 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {exercise.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {sessionExercise.sets}x{sessionExercise.reps} • repos {sessionExercise.rest_seconds}s
          </p>

          {/* Notes du coach si présentes */}
          {sessionExercise.coach_notes && (
            <p className="text-sm text-blue-600 mt-1">
              💡 {sessionExercise.coach_notes}
            </p>
          )}

          {/* Bouton pour afficher/masquer la vidéo */}
          {exercise.video_url && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              {showVideo ? 'Masquer la vidéo' : '▶ Voir la vidéo'}
            </button>
          )}

          {/* Lecteur vidéo inline */}
          {showVideo && exercise.video_url && (
            <div className="mt-2">
              <VideoPlayer url={exercise.video_url} />
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
