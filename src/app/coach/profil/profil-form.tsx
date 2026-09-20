'use client'

// Formulaire de profil coach — prénom, nom, téléphone
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateCoachProfile } from './actions'
import type { Profile } from '@/lib/types'

interface CoachProfileFormProps {
  profile: Profile
}

export function CoachProfileForm({ profile }: CoachProfileFormProps) {
  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [lastName, setLastName] = useState(profile.last_name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    const result = await updateCoachProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      phone: phone.trim() || null,
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/coach" className="text-sm text-[#888] hover:text-[#d4ff00] transition-colors">
          ← Accueil
        </Link>
        <span className="text-[#333]">|</span>
        <h1 className="text-xl font-bold text-white">Mon profil</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="JB"
                required
              />
              <Input
                label="Nom"
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Email</label>
              <input
                value={profile.email}
                readOnly
                className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-[#777] cursor-not-allowed text-sm"
              />
            </div>

            <Input
              label="Téléphone (optionnel)"
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm font-medium">Profil mis à jour</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>
    </div>
  )
}
