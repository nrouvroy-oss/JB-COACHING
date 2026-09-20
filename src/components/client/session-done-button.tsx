'use client'

// Bouton pour marquer une séance comme terminée
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleSession } from '@/app/client/actions'

interface SessionDoneButtonProps {
  sessionId: string
  completed: boolean
}

export function SessionDoneButton({ sessionId, completed }: SessionDoneButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    await toggleSession(sessionId, !completed)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
        completed
          ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
          : 'bg-[#d4ff00] text-black hover:bg-[#c2ee00]'
      }`}
    >
      {loading ? '...' : completed ? '✓ Séance terminée — annuler ?' : 'Marquer comme terminée ✓'}
    </button>
  )
}
