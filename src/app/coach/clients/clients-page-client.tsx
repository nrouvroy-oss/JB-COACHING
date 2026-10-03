'use client'

// Partie client de la page liste des clients — gère l'ajout et l'affichage
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/coach/client-card'
import { AddClientModal } from '@/components/coach/add-client-modal'
import type { Profile } from '@/lib/types'

function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
      else setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-2 px-4 py-1.5 bg-[#d4ff00] text-black text-xs font-bold rounded-lg hover:bg-[#c2ee00] disabled:opacity-60 transition-colors"
    >
      {loading ? 'Redirection...' : 'Passer en Pro'}
    </button>
  )
}

interface ClientsPageClientProps {
  clients: Profile[]
  clientStats: Record<string, { status: string; percent: number }>
  lastActivityMap: Record<string, string>
  maxClients?: number | null  // Limite du plan (3 pour gratuit, null pour pro)
}

export function ClientsPageClient({ clients, clientStats, lastActivityMap, maxClients = 3 }: ClientsPageClientProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const isAtLimit = maxClients !== null && clients.length >= maxClients

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
          <p className="text-sm text-[#888]">
            {clients.length}{maxClients !== null ? `/${maxClients}` : ''} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Alerte limite atteinte avec bouton upgrade */}
      {isAtLimit && (
        <div className="bg-[#d4ff00]/10 border border-[#d4ff00]/20 rounded-xl p-3 mb-4">
          <p className="text-sm text-[#d4ff00] font-medium">Limite du plan gratuit atteinte ({maxClients} clients)</p>
          <p className="text-xs text-[#888] mt-0.5">Passez en Pro pour ajouter des clients illimités — 24€/mois</p>
          <UpgradeButton />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Mes clients</h2>
        <Button onClick={() => setShowAddModal(true)} size="sm" disabled={isAtLimit}>
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
