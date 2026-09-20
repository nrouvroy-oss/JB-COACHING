'use client'

// Formulaire pour définir son mot de passe (invitation ou reset)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError('Erreur lors de la mise à jour du mot de passe')
      setLoading(false)
      return
    }

    setSuccess(true)

    // Récupérer le rôle pour rediriger vers le bon espace
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()

    setTimeout(() => {
      if (profile?.role === 'coach') {
        router.push('/coach')
      } else {
        router.push('/client')
      }
    }, 1500)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-green-500 text-xl">✓</span>
        </div>
        <p className="text-white font-semibold">Mot de passe créé</p>
        <p className="text-[#888] text-sm mt-1">Redirection en cours...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="Minimum 6 caractères"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="Retapez le mot de passe"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#d4ff00] text-black rounded-lg hover:bg-[#c2ee00] disabled:opacity-40 font-semibold text-sm transition-colors"
      >
        {loading ? 'Enregistrement...' : 'Valider mon mot de passe'}
      </button>
    </form>
  )
}
