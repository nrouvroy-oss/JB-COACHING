'use client'

// Mode entraînement : plein écran, un exercice à la fois, vidéo en boucle, chrono intégré
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleSession } from '@/app/client/actions'

interface TrainExercise {
  id: string
  coach_notes: string
  sets?: string
  reps?: string
  exercise: { id: string; name: string; video_url: string; description: string }
}

interface TrainModeProps {
  sessionId: string
  sessionName: string
  workoutName: string
  details: string
  recovery: string
  exercises: TrainExercise[]
}

const TIMER_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1\'', seconds: 60 },
  { label: '2\'', seconds: 120 },
  { label: '3\'', seconds: 180 },
]

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
  } catch { /* Pas de son */ }
}

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

  const [timerMode, setTimerMode] = useState<'idle' | 'stopwatch' | 'countdown'>('idle')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const total = exercises.length
  const current = exercises[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progressPercent = ((currentIndex + 1) / total) * 100

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerRunning(false)
  }, [])

  function resetTimer() { stopTimer(); setTimerMode('idle'); setTimerSeconds(0) }
  function startStopwatch() { stopTimer(); setTimerMode('stopwatch'); setTimerSeconds(0); setTimerRunning(true) }
  function startCountdown(seconds: number) { stopTimer(); setTimerMode('countdown'); setTimerSeconds(seconds); setTimerRunning(true) }

  useEffect(() => {
    if (!timerRunning) return
    intervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (timerMode === 'countdown') {
          if (prev <= 1) { playBeep(); stopTimer(); return 0 }
          return prev - 1
        }
        return prev + 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning, timerMode, stopTimer])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { resetTimer() }, [currentIndex])

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col">
      {/* Barre du haut */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <Link
          href={`/client/session/${sessionId}`}
          className="text-sm text-[#888] hover:text-white transition-colors min-h-[44px] flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Quitter
        </Link>
        <p className="text-xs text-[#888] truncate max-w-[150px] text-center">{sessionName}</p>
        <span className="text-xs text-[#888] tabular-nums min-w-[40px] text-right">{currentIndex + 1}/{total}</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-0.5 bg-[#1a1a1a]">
        <div className="h-full bg-[#d4ff00] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 flex flex-col min-h-0">
        {current.exercise.video_url ? (
          <div className="flex-1 flex items-center justify-center px-4 min-h-0">
            <video
              key={current.exercise.id}
              src={current.exercise.video_url}
              autoPlay loop muted playsInline
              className="w-full max-h-full rounded-2xl object-contain"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Panneau bas */}
      <div className="shrink-0 bg-[#0a0a0a] px-4 pb-8 pt-4">
        {/* Exercice */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>
            {current.exercise.name}
          </h2>
          {(current.sets || current.reps) && (
            <p className="text-lg font-bold text-[#d4ff00] mt-1 tabular-nums">
              {current.sets && current.reps ? `${current.sets} × ${current.reps}` : current.sets || current.reps}
            </p>
          )}
          {current.coach_notes && <p className="text-sm text-[#888] mt-1">{current.coach_notes}</p>}
        </div>

        {/* Timer */}
        <div className="mb-4">
          {timerMode === 'idle' ? (
            <div className="flex items-center justify-center gap-2">
              <button onClick={startStopwatch} className="px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#242424] transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chrono
              </button>
              {TIMER_PRESETS.map(p => (
                <button key={p.seconds} onClick={() => startCountdown(p.seconds)} className="px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#1a1a1a] text-[#d4ff00] hover:bg-[#242424] transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className={`text-4xl font-extrabold tabular-nums ${
                timerMode === 'countdown' && timerSeconds <= 5 && timerSeconds > 0
                  ? 'text-red-400' : timerMode === 'countdown' ? 'text-[#d4ff00]' : 'text-white'
              }`} style={{ fontFamily: 'Bricolage Grotesque' }}>
                {formatTime(timerSeconds)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => timerRunning ? stopTimer() : setTimerRunning(true)}
                  className="w-11 h-11 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#242424] transition-colors flex items-center justify-center"
                  aria-label={timerRunning ? 'Pause' : 'Reprendre'}
                >
                  {timerRunning ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5.14v14.72a1 1 0 001.5.86l11.14-7.36a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" /></svg>
                  )}
                </button>
                <button onClick={resetTimer} className="w-11 h-11 rounded-xl bg-[#1a1a1a] text-[#888] hover:bg-[#242424] transition-colors flex items-center justify-center" aria-label="Réinitialiser">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {(details || recovery) && (
          <>
            <button onClick={() => setShowInfo(!showInfo)} className="text-xs text-[#d4ff00] mx-auto block mb-3 min-h-[44px] flex items-center justify-center">
              {showInfo ? 'Masquer les instructions' : 'Voir les instructions'}
            </button>
            {showInfo && (
              <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 space-y-2">
                {workoutName && <span className="inline-block bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full font-medium">{workoutName}</span>}
                {details && <div><p className="text-xs text-[#888] uppercase tracking-wide">Description</p><p className="text-sm text-white whitespace-pre-line mt-0.5">{details}</p></div>}
                {recovery && <div><p className="text-xs text-[#888] uppercase tracking-wide">Récupération</p><p className="text-sm text-[#d4ff00] mt-0.5">{recovery}</p></div>}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => { if (!isFirst) setCurrentIndex(prev => prev - 1) }}
            disabled={isFirst}
            className={`flex-1 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all ${
              isFirst ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#242424] active:scale-[0.97]'
            }`}
          >
            Précédent
          </button>
          {isLast ? (
            <button
              onClick={async () => { setFinishing(true); await toggleSession(sessionId, true); router.push(`/client/session/${sessionId}`) }}
              disabled={finishing}
              className="flex-1 py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-[#d4ff00] text-black hover:bg-[#c2ee00] transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              {finishing ? 'Enregistrement...' : 'Terminer'}
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(prev => prev + 1)} className="flex-1 py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-[#d4ff00] text-black hover:bg-[#c2ee00] transition-all active:scale-[0.97]">
              Suivant
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
