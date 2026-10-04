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
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Mes clients</h1>
          <p className="text-sm text-[#888]">
            {clients.length}{maxClients !== null ? `/${maxClients}` : ''} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" disabled={isAtLimit}>
          + Ajouter
        </Button>
      </div>

      {/* Alerte limite atteinte */}
      {isAtLimit && (
        <div className="bg-[#d4ff00]/[0.05] border border-[#d4ff00]/15 rounded-xl p-4 mb-4">
          <p className="text-sm text-[#d4ff00] font-bold">Limite atteinte</p>
          <p className="text-xs text-[#888] mt-0.5">{maxClients} clients max en plan gratuit. Passez en Pro pour débloquer.</p>
          <UpgradeButton />
        </div>
      )}

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
