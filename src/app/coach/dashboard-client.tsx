'use client'

// Partie client du tableau de bord coach — gère l'affichage et le modal d'ajout
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/coach/client-card'
import { AddClientModal } from '@/components/coach/add-client-modal'
import type { Profile } from '@/lib/types'

interface CoachDashboardClientProps {
  clients: Profile[]
  clientStats: Record<string, { status: string; percent: number }>
}

export function CoachDashboardClient({ clients, clientStats }: CoachDashboardClientProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          + Ajouter
        </Button>
      </div>

      {/* Liste des clients ou message vide */}
      {clients.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucun client pour le moment. Ajoutez votre premier client !
        </p>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              programStatus={clientStats[client.id]?.status ?? null}
              completionPercent={clientStats[client.id]?.percent ?? 0}
            />
          ))}
        </div>
      )}

      {/* Modal d'ajout de client */}
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
