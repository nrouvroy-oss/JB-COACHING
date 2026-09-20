'use client'

// Formulaire de connexion avec lien mot de passe oublié
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    // Récupérer le rôle pour rediriger vers le bon espace
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()

    if (profile?.role === 'coach') {
      router.push('/coach')
    } else {
      router.push('/client')
    }
    router.refresh()
  }

  // Envoyer un email de réinitialisation
  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Entre ton email ci-dessus')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password`,
    })

    setLoading(false)
    if (resetError) {
      setError('Erreur lors de l\'envoi')
      return
    }
    setResetSent(true)
  }

  if (resetSent) {
    return (
      <div className="text-center w-full">
        <div className="w-12 h-12 rounded-full bg-[#d4ff00]/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-[#d4ff00] text-xl">✉</span>
        </div>
        <p className="text-white font-semibold">Email envoyé</p>
        <p className="text-[#888] text-sm mt-1">Vérifie ta boîte mail pour réinitialiser ton mot de passe.</p>
        <button
          onClick={() => { setResetSent(false); setShowReset(false) }}
          className="text-[#d4ff00] text-sm mt-4 hover:text-[#c2ee00] transition-colors"
        >
          ← Retour à la connexion
        </button>
      </div>
    )
  }

  if (showReset) {
    return (
      <form onSubmit={handleReset} className="space-y-4 w-full">
        <p className="text-sm text-[#888] text-center">Entre ton email pour recevoir un lien de réinitialisation</p>
        <div>
          <label htmlFor="reset-email" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
            placeholder="votre@email.com"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1.5 px-3 bg-[#d4ff00] text-black rounded-lg hover:bg-[#c2ee00] disabled:opacity-40 font-semibold text-sm transition-colors"
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
        <button
          type="button"
          onClick={() => { setShowReset(false); setError('') }}
          className="w-full text-[#888] text-sm hover:text-white transition-colors"
        >
          ← Retour à la connexion
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="votre@email.com"
        />
      </div>
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
          className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-1.5 px-3 bg-[#d4ff00] text-black rounded-lg hover:bg-[#c2ee00] disabled:opacity-40 font-semibold text-sm transition-colors"
      >
        {loading ? 'Connexion...' : 'Connexion'}
      </button>
      <button
        type="button"
        onClick={() => { setShowReset(true); setError('') }}
        className="w-full text-[#888] text-sm hover:text-white transition-colors"
      >
        Mot de passe oublié ?
      </button>
    </form>
  )
}
