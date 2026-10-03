'use client'

// Formulaire d'inscription coach — crée le compte Supabase + profil avec rôle coach
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      setLoading(false)
      return
    }

    const supabase = createBrowserClient()

    // Créer le compte avec les métadonnées pour le trigger de création de profil
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          role: 'coach',
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Cet email est déjà utilisé')
      } else {
        setError('Erreur lors de la création du compte')
      }
      setLoading(false)
      return
    }

    // Rediriger vers l'espace coach
    router.push('/coach')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-3 py-3 min-h-[44px] bg-[#111] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
            placeholder="Jean"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-3 py-3 min-h-[44px] bg-[#111] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
            placeholder="Dupont"
          />
        </div>
      </div>
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
          className="w-full px-3 py-3 min-h-[44px] bg-[#111] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="coach@email.com"
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
          minLength={6}
          className="w-full px-3 py-3 min-h-[44px] bg-[#111] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#777] text-sm"
          placeholder="6 caractères minimum"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 min-h-[44px] px-3 bg-[#d4ff00] text-black rounded-xl hover:bg-[#c2ee00] disabled:opacity-40 font-bold text-sm transition-colors active:scale-[0.97]"
      >
        {loading ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  )
}
