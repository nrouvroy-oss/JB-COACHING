'use client'

// Mode entraînement : un exercice à la fois, vidéo en boucle, chronomètre intégré
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleSession } from '@/app/client/actions'

interface TrainExercise {
  id: string
  coach_notes: string
  sets?: string
  reps?: string
  exercise: {
    id: string
    name: string
    video_url: string
    description: string
  }
}

interface TrainModeProps {
  sessionId: string
  sessionName: string
  workoutName: string
  details: string
  recovery: string
  exercises: TrainExercise[]
}

// Presets de minuteur (en secondes)
const TIMER_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1min', seconds: 60 },
  { label: '2min', seconds: 120 },
  { label: '3min', seconds: 180 },
]

// Bip sonore (3 bips courts)
function playBeep() {
  try {
    const ctx = new AudioContext()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.start(ctx.currentTime + i * 0.25)
      osc.stop(ctx.currentTime + i * 0.25 + 0.15)
    }
  } catch {
    // Pas de son disponible
  }
}

// Format mm:ss
function formatTime(s: number) {
  const min = Math.floor(s / 60)
  const sec = s % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function TrainMode({ sessionId, sessionName, workoutName, details, recovery, exercises }: TrainModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const router = useRouter()

  // Timer state
  const [timerMode, setTimerMode] = useState<'idle' | 'stopwatch' | 'countdown'>('idle')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const total = exercises.length
  const current = exercises[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  // Stopper le timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerRunning(false)
  }, [])

  // Reset complet du timer
  function resetTimer() {
    stopTimer()
    setTimerMode('idle')
    setTimerSeconds(0)
  }

  // Lancer le chronomètre (compte en montant)
  function startStopwatch() {
    stopTimer()
    setTimerMode('stopwatch')
    setTimerSeconds(0)
    setTimerRunning(true)
  }

  // Lancer un minuteur (compte à rebours)
  function startCountdown(seconds: number) {
    stopTimer()
    setTimerMode('countdown')
    setTimerSeconds(seconds)
    setTimerRunning(true)
  }

  // Tick du timer
  useEffect(() => {
    if (!timerRunning) return
    intervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (timerMode === 'countdown') {
          if (prev <= 1) {
            playBeep()
            stopTimer()
            return 0
          }
          return prev - 1
        }
        // Chronomètre : compte en montant
        return prev + 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning, timerMode, stopTimer])

  // Reset le timer quand on change d'exercice
  useEffect(() => {
    resetTimer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  function goNext() {
    if (!isLast) setCurrentIndex(prev => prev + 1)
  }

  function goPrev() {
    if (!isFirst) setCurrentIndex(prev => prev - 1)
  }

  return (
    <div className="fixed inset-0 bg-[#141414] z-50 flex flex-col">
      {/* Barre du haut — quitter + progression */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <Link
          href={`/client/session/${sessionId}`}
          className="text-sm text-[#888] hover:text-white transition-colors"
        >
          ← Quitter
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {exercises.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-[#d4ff00]' : i < currentIndex ? 'bg-[#d4ff00]/40' : 'bg-[#333]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#888] ml-1">{currentIndex + 1}/{total}</span>
        </div>
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 flex flex-col min-h-0">
        {current.exercise.video_url ? (
          <div className="flex-1 flex items-center justify-center px-4 min-h-0">
            <video
              key={current.exercise.id}
              src={current.exercise.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-h-full rounded-2xl object-contain"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#555] text-sm">Pas de vidéo pour cet exercice</p>
          </div>
        )}
      </div>

      {/* Bas de page : exercice + chrono + navigation */}
      <div className="shrink-0 px-4 pb-6 pt-3">
        {/* Nom de l'exercice + séries/reps */}
        <h2 className="text-xl font-bold text-white text-center">{current.exercise.name}</h2>
        {(current.sets || current.reps) && (
          <p className="text-lg font-bold text-[#d4ff00] text-center mt-1">
            {current.sets && current.reps ? `${current.sets} x ${current.reps}` : current.sets || current.reps}
          </p>
        )}
        {current.coach_notes && (
          <p className="text-sm text-[#888] text-center mt-1">{current.coach_notes}</p>
        )}

        {/* Chronomètre / Minuteur */}
        <div className="mt-3">
          {timerMode === 'idle' ? (
            // Boutons pour lancer un timer
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={startStopwatch}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-white hover:bg-[#2a2a2a] transition-colors"
              >
                ⏱ Chrono
              </button>
              {TIMER_PRESETS.map(p => (
                <button
                  key={p.seconds}
                  onClick={() => startCountdown(p.seconds)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-[#d4ff00] hover:bg-[#2a2a2a] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            // Timer actif
            <div className="flex items-center justify-center gap-4">
              <span className={`text-3xl font-bold tabular-nums ${
                timerMode === 'countdown' && timerSeconds <= 5 && timerSeconds > 0
                  ? 'text-red-400'
                  : timerMode === 'countdown' ? 'text-[#d4ff00]' : 'text-white'
              }`}>
                {formatTime(timerSeconds)}
              </span>
              <div className="flex gap-2">
                {timerRunning ? (
                  <button
                    onClick={stopTimer}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => setTimerRunning(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-[#d4ff00] hover:bg-[#2a2a2a] transition-colors"
                  >
                    Reprendre
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-[#888] hover:bg-[#2a2a2a] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions dépliables */}
        {(details || recovery) && (
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-[#d4ff00] mx-auto block mt-3"
          >
            {showInfo ? 'Masquer les instructions' : 'Voir les instructions'}
          </button>
        )}
        {showInfo && (
          <div className="bg-[#1c1c1c] rounded-xl p-3 mt-2 space-y-2">
            {workoutName && (
              <span className="inline-block bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">
                {workoutName}
              </span>
            )}
            {details && (
              <div>
                <p className="text-xs text-[#888] uppercase tracking-wide">Description</p>
                <p className="text-sm text-white whitespace-pre-line mt-0.5">{details}</p>
              </div>
            )}
            {recovery && (
              <div>
                <p className="text-xs text-[#888] uppercase tracking-wide">Récupération</p>
                <p className="text-sm text-[#d4ff00] mt-0.5">{recovery}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
              isFirst
                ? 'bg-[#1c1c1c] text-[#555] cursor-not-allowed'
                : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            ← Précédent
          </button>
          {isLast ? (
            <button
              onClick={async () => {
                setFinishing(true)
                await toggleSession(sessionId, true)
                router.push(`/client/session/${sessionId}`)
              }}
              disabled={finishing}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#d4ff00] text-black hover:bg-[#c2ee00] transition-colors disabled:opacity-50"
            >
              {finishing ? 'Enregistrement...' : 'Terminer ✓'}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#d4ff00] text-black hover:bg-[#c2ee00] transition-colors"
            >
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
