'use client'

// Composant client pour la fiche détaillée d'un client — formulaire d'édition complet
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

// Calcule l'âge à partir d'une date de naissance (format YYYY-MM-DD)
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Formate une date ISO en format lisible français
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ClientDetail({ client }: ClientDetailProps) {
  // État local du formulaire — initialisé avec les données du client
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

    // Composition du nom complet pour la compatibilité ascendante
    const fullName = `${firstName} ${lastName}`.trim()

    const result = await updateClientProfile(client.id, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: fullName,
      phone: phone.trim() || null,
      birth_date: birthDate || null,
      gender: gender || null,
      height_cm: heightCm ? parseInt(heightCm) : null,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      objective: objective || null,
      notes: notes.trim() || null,
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* En-tête avec navigation retour */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/coach/clients/${client.id}/program`}
          className="text-sm text-[#888] hover:text-[#d4ff00] transition-colors"
        >
          ← Plan
        </Link>
        <span className="text-[#333]">|</span>
        <h1 className="text-xl font-bold text-white">Fiche client</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Section : Informations générales ── */}
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-5">
          <h2 className="font-semibold text-white mb-4">Informations générales</h2>
          <div className="space-y-4">

            {/* Prénom et nom séparés */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                required
              />
              <Input
                label="Nom"
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                required
              />
            </div>

            {/* Email — lecture seule */}
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                value={client.email}
                readOnly
                className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-[#777] cursor-not-allowed text-sm"
              />
            </div>

            {/* Téléphone */}
            <Input
              label="Téléphone (optionnel)"
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />

            {/* Date de naissance + âge calculé automatiquement */}
            <div>
              <Input
                label="Date de naissance (optionnel)"
                id="birth_date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {birthDate && (
                <p className="text-sm text-[#888] mt-1">
                  Âge : <span className="font-medium text-[#ccc]">{calculateAge(birthDate)} ans</span>
                </p>
              )}
            </div>

            {/* Date d'inscription — lecture seule */}
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
                Date d&apos;inscription
              </label>
              <input
                value={formatDate(client.created_at)}
                readOnly
                className="w-full px-3 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-[#777] cursor-not-allowed text-sm"
              />
            </div>

          </div>
        </div>

        {/* ── Section : Objectif & notes ── */}
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-5">
          <h2 className="font-semibold text-white mb-4">Objectif &amp; notes</h2>
          <div className="space-y-4">

            {/* Objectif */}
            <div>
              <label htmlFor="objective" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
                Objectif (optionnel)
              </label>
              <select
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white text-sm transition-colors"
              >
                <option value="">— Sélectionner un objectif —</option>
                <option value="Prise de masse">Prise de masse</option>
                <option value="Perte de poids">Perte de poids</option>
                <option value="Remise en forme">Remise en forme</option>
                <option value="Performance">Performance</option>
                <option value="Rééducation">Rééducation</option>
              </select>
            </div>

            {/* Notes libres */}
            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Blessures, conditions médicales, remarques..."
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors resize-none"
              />
            </div>

          </div>
        </div>

        {/* ── Section : Informations physiques ── */}
        <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-white">Informations physiques</h2>
            <span className="text-xs text-[#777] italic">optionnels</span>
          </div>
          <p className="text-xs text-[#777] mb-4">Ces données restent strictement confidentielles.</p>
          <div className="space-y-4">

            {/* Genre */}
            <div>
              <label htmlFor="gender" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
                Genre
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white text-sm transition-colors"
              >
                <option value="">— Non renseigné —</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            {/* Taille et poids côte à côte sur mobile */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Taille (cm)"
                id="height_cm"
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="175"
              />
              <Input
                label="Poids (kg)"
                id="weight_kg"
                type="number"
                min={30}
                max={300}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="70"
              />
            </div>

          </div>
        </div>

        {/* Messages de retour */}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm font-medium">Profil mis à jour avec succès !</p>}

        {/* Bouton de sauvegarde */}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>

      </form>

      {/* Suppression du client — zone danger */}
      <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
        <button
          onClick={async () => {
            const name = `${firstName} ${lastName}`.trim() || client.email
            if (!confirm(`Supprimer définitivement ${name} et toutes ses données (programmes, séances, logs) ?\n\nCette action est irréversible.`)) return
            await deleteClient(client.id)
            router.push('/coach/clients')
          }}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Supprimer ce client
        </button>
      </div>
    </div>
  )
}
