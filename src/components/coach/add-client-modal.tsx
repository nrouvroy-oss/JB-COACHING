'use client'

// Modal de création d'un compte client — appelle la Server Action createClient
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/app/coach/actions'

interface AddClientModalProps {
  onClose: () => void
}

export function AddClientModal({ onClose }: AddClientModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createClient(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Fermer le modal après succès
    onClose()
  }

  return (
    <Modal title="Ajouter un client" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champs obligatoires — prénom et nom séparés */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" id="first_name" name="first_name" required placeholder="Jean" />
          <Input label="Nom" id="last_name" name="last_name" required placeholder="Dupont" />
        </div>
        <Input label="Email" id="email" name="email" type="email" required placeholder="jean@email.com" />
        <p className="text-xs text-[#888] -mt-2">Le client recevra un email pour créer son mot de passe</p>

        {/* Champs optionnels */}
        <Input label="Téléphone (optionnel)" id="phone" name="phone" type="tel" placeholder="06 12 34 56 78" />
        <Input label="Date de naissance (optionnel)" id="birth_date" name="birth_date" type="date" />

        {/* Sélecteur d'objectif */}
        <div>
          <label htmlFor="objective" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
            Objectif (optionnel)
          </label>
          <select
            id="objective"
            name="objective"
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
            name="notes"
            rows={3}
            placeholder="Blessures, conditions médicales, remarques..."
            className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Envoi de l\'invitation...' : 'Inviter le client'}
        </Button>
      </form>
    </Modal>
  )
}
