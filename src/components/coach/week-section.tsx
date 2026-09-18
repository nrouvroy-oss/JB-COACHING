'use client'

// Accordéon représentant une semaine du programme avec ses séances
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionEditor } from '@/components/coach/session-editor'
import { deleteWeek, addSession } from '@/app/coach/clients/[id]/program/actions'
import type { WeekWithSessions, Exercise } from '@/lib/types'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

interface WeekSectionProps {
  week: WeekWithSessions
  exercises: Exercise[]
  clientId: string
}

export function WeekSection({ week, exercises, clientId }: WeekSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [sessionDay, setSessionDay] = useState(DAYS[0])
  const router = useRouter()

  async function handleAddSession() {
    if (!sessionName.trim()) return
    await addSession(week.id, sessionName, sessionDay, clientId)
    setSessionName('')
    setShowAddSession(false)
    router.refresh()
  }

  async function handleDeleteWeek() {
    if (!confirm(`Supprimer la semaine ${week.week_number} et toutes ses séances ?`)) return
    await deleteWeek(week.id, clientId)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* En-tête accordéon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <h3 className="font-bold text-gray-900">Semaine {week.week_number}</h3>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Séances de la semaine */}
          {week.sessions
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => (
              <SessionEditor
                key={session.id}
                session={session}
                exercises={exercises}
                clientId={clientId}
              />
            ))}

          {/* Formulaire d'ajout de séance */}
          {showAddSession ? (
            <div className="flex gap-2 items-end">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Nom de la séance"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <select
                value={sessionDay}
                onChange={(e) => setSessionDay(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <Button size="sm" onClick={handleAddSession}>OK</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowAddSession(false)}>Annuler</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowAddSession(true)}>+ Séance</Button>
              <Button size="sm" variant="danger" onClick={handleDeleteWeek}>Suppr. semaine</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
