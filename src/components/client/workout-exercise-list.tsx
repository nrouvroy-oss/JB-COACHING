'use client'

// Liste interactive des exercices d'un programme — clic sur un exercice = voir sa vidéo/média
import { useState } from 'react'
import Link from 'next/link'
import { MediaViewer } from '@/components/ui/media-viewer'

interface WorkoutExerciseData {
  id: string
  coach_notes: string
  sets?: string
  reps?: string
  exercise: {
    name: string
    video_url: string
  }
}

interface WorkoutExerciseListProps {
  exercises: WorkoutExerciseData[]
  workoutName: string
  sessionId: string
  details?: string
  recovery?: string
}

export function WorkoutExerciseList({ exercises, workoutName, sessionId, details, recovery }: WorkoutExerciseListProps) {
  // ID de l'exercice dont on affiche la vidéo (null = aucun)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  function toggleVideo(id: string) {
    setActiveVideoId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {/* Carte programme + description + récupération */}
      <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
        {/* Nom du programme + bouton lancer */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-[#d4ff00]/10 text-[#d4ff00] text-sm px-3 py-1 rounded-full font-semibold">
            {workoutName}
          </span>
          <Link
            href={`/client/session/${sessionId}/train`}
            className="bg-[#d4ff00] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-[#c2ee00] transition-colors"
          >
            Commencer ▶
          </Link>
        </div>

        {details && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#888] uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-white whitespace-pre-line">{details}</p>
          </div>
        )}
        {recovery && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#888] uppercase tracking-wide mb-1">Récupération</p>
            <p className="text-sm text-[#d4ff00]">{recovery}</p>
          </div>
        )}

        {/* Liste des exercices */}
        {exercises.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#888] uppercase tracking-wide mb-2">Exercices</p>
            <div className="grid gap-1">
              {exercises.map((we, index) => (
                <div key={we.id}>
                  <button
                    onClick={() => we.exercise.video_url ? toggleVideo(we.id) : undefined}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      we.exercise.video_url
                        ? 'hover:bg-[#242424] active:bg-[#2a2a2a] cursor-pointer'
                        : 'cursor-default'
                    } ${activeVideoId === we.id ? 'bg-[#242424]' : ''}`}
                  >
                    <span className="text-sm font-bold text-[#d4ff00] w-6 text-center shrink-0">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{we.exercise.name}</p>
                        {(we.sets || we.reps) && (
                          <span className="text-xs text-[#d4ff00] font-medium shrink-0">
                            {we.sets && we.reps ? `${we.sets}x${we.reps}` : we.sets || we.reps}
                          </span>
                        )}
                      </div>
                      {we.coach_notes && (
                        <p className="text-xs text-[#777] mt-0.5">{we.coach_notes}</p>
                      )}
                    </div>
                    {we.exercise.video_url && (
                      <span className="text-xs text-[#555] shrink-0">
                        {activeVideoId === we.id ? '✕' : '▶'}
                      </span>
                    )}
                  </button>
                  {/* Vidéo/média inline */}
                  {activeVideoId === we.id && we.exercise.video_url && (
                    <div className="px-3 pb-2 pt-1">
                      <MediaViewer url={we.exercise.video_url} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
