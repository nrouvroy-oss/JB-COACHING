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
  const [showPassword, setShowPassword] = useState(false)
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
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password&type=reset`,
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
            className="w-full px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
            placeholder="votre@email.com"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 min-h-[44px] px-3 bg-[#d4ff00] text-black rounded-lg hover:bg-[#c2ee00] disabled:opacity-40 font-semibold text-sm transition-colors active:scale-[0.97]"
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
          className="w-full px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="votre@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-3 pr-11 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors p-1"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 min-h-[44px] px-3 bg-[#d4ff00] text-black rounded-lg hover:bg-[#c2ee00] disabled:opacity-40 font-semibold text-sm transition-colors active:scale-[0.97]"
      >
        {loading ? 'Connexion...' : 'Connexion'}
      </button>
      <button
        type="button"
        onClick={() => { setShowReset(true); setError('') }}
        className="w-full min-h-[44px] text-[#888] text-sm hover:text-white transition-colors"
      >
        Mot de passe oublié ?
      </button>
    </form>
  )
}
