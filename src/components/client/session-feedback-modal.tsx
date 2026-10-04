'use client'

// Modal feedback post-séance — RPE, ressenti, complétion, données réelles optionnelles
import { useState, useTransition } from 'react'
import { Modal } from '@/components/ui/modal'
import { submitSessionFeedback } from '@/app/client/actions'

// Valeurs de complétion (oui / partiellement / non)
type CompletionValue = 'yes' | 'partial' | 'no'
// Valeurs de ressenti (très bien → douleur)
type FeelingValue = 'great' | 'good' | 'tired' | 'very_tired' | 'pain'

const COMPLETION_OPTIONS: { value: CompletionValue; label: string }[] = [
  { value: 'yes', label: 'Oui' },
  { value: 'partial', label: 'Partiellement' },
  { value: 'no', label: 'Non' },
]

const FEELING_OPTIONS: { value: FeelingValue; label: string }[] = [
  { value: 'great', label: 'Très bien' },
  { value: 'good', label: 'Bien' },
  { value: 'tired', label: 'Fatigué' },
  { value: 'very_tired', label: 'Très fatigué' },
  { value: 'pain', label: 'Douleur' },
]

// Couleurs RPE selon l'intensité (vert → rouge)
function getRpeColor(rpe: number, selected: boolean): string {
  if (!selected) return 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]'
  if (rpe <= 3) return 'bg-emerald-600 text-white border border-emerald-600'
  if (rpe <= 5) return 'bg-yellow-500 text-black border border-yellow-500'
  if (rpe <= 7) return 'bg-orange-500 text-white border border-orange-500'
  return 'bg-red-600 text-white border border-red-600'
}

interface SessionFeedbackModalProps {
  sessionId: string
  onClose: () => void
  onSubmitted: () => void
}

export function SessionFeedbackModal({ sessionId, onClose, onSubmitted }: SessionFeedbackModalProps) {
  // État du formulaire
  const [completion, setCompletion] = useState<CompletionValue>('yes')
  const [rpe, setRpe] = useState<number | null>(null)
  const [feeling, setFeeling] = useState<FeelingValue | null>(null)
  const [comment, setComment] = useState('')
  const [showSortieData, setShowSortieData] = useState(false)
  const [actualDuration, setActualDuration] = useState('')
  const [actualDistance, setActualDistance] = useState('')
  const [actualElevation, setActualElevation] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await submitSessionFeedback(
        sessionId,
        completion,
        rpe,
        feeling,
        comment.trim() || null,
        actualDuration ? parseInt(actualDuration) : null,
        actualDistance ? parseFloat(actualDistance) : null,
        actualElevation ? parseInt(actualElevation) : null,
      )
      if (result?.error) {
        setErrorMsg(result.error)
        return
      }
      onSubmitted()
    })
  }

  return (
    <Modal title="Comment s'est passée la séance ?" onClose={onClose}>
      <div className="space-y-6">

        {/* Complétion */}
        <div>
          <p className="text-sm font-semibold text-[#ccc] mb-3">As-tu terminé la séance ?</p>
          <div className="flex gap-2">
            {COMPLETION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCompletion(opt.value)}
                className={`flex-1 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                  completion === opt.value
                    ? 'bg-[#d4ff00] text-black border border-[#d4ff00]'
                    : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#444]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* RPE — rangée de 10 boutons */}
        <div>
          <p className="text-sm font-semibold text-[#ccc] mb-1">
            Difficulté ressentie
            {rpe && <span className="text-[#888] font-normal"> — {rpe}/10</span>}
          </p>
          <p className="text-xs text-[#666] mb-3">1 = très facile · 10 = effort maximal</p>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setRpe(rpe === n ? null : n)}
                className={`h-[44px] rounded-xl text-sm font-bold transition-all active:scale-[0.95] ${getRpeColor(n, rpe === n)}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Ressenti */}
        <div>
          <p className="text-sm font-semibold text-[#ccc] mb-3">Comment te sens-tu ?</p>
          <div className="flex flex-wrap gap-2">
            {FEELING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFeeling(feeling === opt.value ? null : opt.value)}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                  feeling === opt.value
                    ? 'bg-[#d4ff00] text-black border border-[#d4ff00]'
                    : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#444]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commentaire libre */}
        <div>
          <label className="text-sm font-semibold text-[#ccc] mb-2 block">
            Commentaire <span className="text-[#666] font-normal">(optionnel)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Ce qui s'est bien passé, une difficulté, une note pour ton coach…"
            rows={3}
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d4ff00] transition-colors resize-none min-h-[88px]"
          />
        </div>

        {/* Section données sortie — masquée par défaut */}
        <div>
          <button
            onClick={() => setShowSortieData(prev => !prev)}
            className="flex items-center gap-2 text-sm font-semibold text-[#d4ff00] min-h-[44px] w-full"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showSortieData ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Données réelles de la sortie
          </button>

          {showSortieData && (
            <div className="mt-3 space-y-3 border-l-2 border-[#2a2a2a] pl-4">
              {/* Durée réelle */}
              <div>
                <label className="text-xs text-[#888] mb-1 block">Durée réelle (minutes)</label>
                <input
                  type="number"
                  min={0}
                  value={actualDuration}
                  onChange={e => setActualDuration(e.target.value)}
                  placeholder="ex : 75"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 min-h-[44px] text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>
              {/* Distance réelle */}
              <div>
                <label className="text-xs text-[#888] mb-1 block">Distance réelle (km)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={actualDistance}
                  onChange={e => setActualDistance(e.target.value)}
                  placeholder="ex : 12.5"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 min-h-[44px] text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>
              {/* D+ réel */}
              <div>
                <label className="text-xs text-[#888] mb-1 block">Dénivelé positif réel (m)</label>
                <input
                  type="number"
                  min={0}
                  value={actualElevation}
                  onChange={e => setActualElevation(e.target.value)}
                  placeholder="ex : 450"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 min-h-[44px] text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <p className="text-sm text-red-400 text-center">{errorMsg}</p>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#444] transition-colors disabled:opacity-50"
          >
            Passer
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-[#d4ff00] text-black hover:bg-[#c2ee00] transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {isPending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
