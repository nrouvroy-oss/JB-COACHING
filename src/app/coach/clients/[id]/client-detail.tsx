'use client'

// Fiche client détaillée — formulaire d'édition avec sections visuelles
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { updateClientProfile, deleteClient } from './actions'
import type { Profile } from '@/lib/types'

interface ClientDetailProps {
  client: Profile
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getInitials(client: Profile): string {
  if (client.first_name && client.last_name) return `${client.first_name[0]}${client.last_name[0]}`.toUpperCase()
  return (client.full_name?.[0] ?? '?').toUpperCase()
}

export function ClientDetail({ client }: ClientDetailProps) {
  const [firstName, setFirstName] = useState(client.first_name ?? '')
  const [lastName, setLastName] = useState(client.last_name ?? '')
  const [phone, setPhone] = useState(client.phone ?? '')
  const [birthDate, setBirthDate] = useState(client.birth_date ?? '')
  const [gender, setGender] = useState(client.gender ?? '')
  const [heightCm, setHeightCm] = useState(client.height_cm?.toString() ?? '')
  const [weightKg, setWeightKg] = useState(client.weight_kg?.toString() ?? '')
  const [objective, setObjective] = useState(client.objective ?? '')
  const [notes, setNotes] = useState(client.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')
    const fullName = `${firstName} ${lastName}`.trim()
    const result = await updateClientProfile(client.id, {
      first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName,
      phone: phone.trim() || null, birth_date: birthDate || null, gender: gender || null,
      height_cm: heightCm ? parseInt(heightCm) : null, weight_kg: weightKg ? parseFloat(weightKg) : null,
      objective: objective || null, notes: notes.trim() || null,
    })
    setSaving(false)
    if (result.error) { setError(result.error) } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  const initials = getInitials(client)
  const name = `${firstName || client.first_name} ${lastName || client.last_name}`.trim() || client.full_name

  return (
    <div>
      {/* En-tête client avec avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
          <span className="text-[#d4ff00] font-extrabold text-lg">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{name}</h1>
          <p className="text-sm text-[#888] truncate">{client.email}</p>
          <p className="text-xs text-[#666]">Inscrit le {formatDate(client.created_at)}</p>
        </div>
        <Link
          href={`/coach/clients/${client.id}/program`}
          className="text-xs text-[#888] hover:text-[#d4ff00] font-medium transition-colors border border-[#2a2a2a] hover:border-[#d4ff00]/30 rounded-lg px-3 py-2 min-h-[44px] flex items-center shrink-0"
        >
          Plan
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Section : Identité */}
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Identité
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Prénom" id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Nom" id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <Input label="Téléphone" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" />
            <div>
              <Input label="Date de naissance" id="birth_date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              {birthDate && (
                <p className="text-xs text-[#888] mt-1">{calculateAge(birthDate)} ans</p>
              )}
            </div>
          </div>
        </section>

        {/* Section : Objectif */}
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Objectif
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <select
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white text-sm"
            >
              <option value="">— Sélectionner —</option>
              <option value="Prise de masse">Prise de masse</option>
              <option value="Perte de poids">Perte de poids</option>
              <option value="Remise en forme">Remise en forme</option>
              <option value="Performance">Performance</option>
              <option value="Rééducation">Rééducation</option>
              <option value="Préparation physique">Préparation physique</option>
            </select>
            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Blessures, conditions, remarques..."
                className="w-full px-3 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white placeholder:text-[#555] text-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* Section : Physique */}
        <section className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242424]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Physique
              <span className="text-xs text-[#555] font-normal ml-auto">optionnel</span>
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-3 min-h-[44px] bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] text-white text-sm"
            >
              <option value="">Genre</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Taille (cm)" id="height_cm" type="number" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" />
              <Input label="Poids (kg)" id="weight_kg" type="number" min={30} max={300} step={0.1} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" />
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-emerald-500 text-sm font-medium">Profil mis à jour</p>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>

      {/* Zone danger */}
      <div className="mt-10 pt-6 border-t border-[#2a2a2a]">
        <button
          onClick={async () => {
            if (!confirm(`Supprimer définitivement ${name} et toutes ses données ?\n\nCette action est irréversible.`)) return
            await deleteClient(client.id)
            router.push('/coach/clients')
          }}
          className="text-sm text-[#555] hover:text-red-400 transition-colors min-h-[44px] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Supprimer ce client
        </button>
      </div>
    </div>
  )
}
