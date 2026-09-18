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
        <Input label="Nom complet" id="full_name" name="full_name" required placeholder="Jean Dupont" />
        <Input label="Email" id="email" name="email" type="email" required placeholder="jean@email.com" />
        <Input label="Mot de passe temporaire" id="password" name="password" type="text" required placeholder="min. 6 caractères" minLength={6} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Création...' : 'Créer le compte client'}
        </Button>
      </form>
    </Modal>
  )
}
