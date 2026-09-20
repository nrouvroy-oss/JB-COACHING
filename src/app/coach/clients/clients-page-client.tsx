'use client'

// Partie client de la page liste des clients — gère l'ajout et l'affichage
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/coach/client-card'
import { AddClientModal } from '@/components/coach/add-client-modal'
import type { Profile } from '@/lib/types'

interface ClientsPageClientProps {
  clients: Profile[]
  clientStats: Record<string, { status: string; percent: number }>
  lastActivityMap: Record<string, string>
}

export function ClientsPageClient({ clients, clientStats, lastActivityMap }: ClientsPageClientProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      {/* Bannière compacte avec photo de fond — liste des clients */}
      <div className="relative h-20 rounded-xl overflow-hidden mb-4">
        <img
          src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4">
          <h1 className="text-xl font-bold text-white">Mes clients</h1>
          <p className="text-sm text-[#888]">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Mes clients</h2>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          + Ajouter
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#888] mb-4">
            Aucun client pour le moment. Ajoutez votre premier client !
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            + Ajouter un client
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              programStatus={clientStats[client.id]?.status ?? null}
              completionPercent={clientStats[client.id]?.percent ?? 0}
              lastActivityAt={lastActivityMap[client.id] ?? null}
            />
          ))}
        </div>
      )}

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
