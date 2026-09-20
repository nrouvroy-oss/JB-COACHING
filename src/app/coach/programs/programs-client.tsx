'use client'

// Composant client de la page Programmes — liste les modèles et les programmes assignés
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { createTemplate, deleteTemplate, renameTemplate } from './actions'

// ── Types des props ──────────────────────────────────────────────────────────

interface TemplateProgram {
  id: string
  name: string
  coach_id: string
  status: string
  created_at: string
  weeks: { id: string; week_number: number; sessions: { id: string }[] }[]
}

interface AssignedProgram {
  id: string
  name: string
  status: string
  created_at: string
  client: { id: string; full_name: string; first_name?: string | null; last_name?: string | null } | { id: string; full_name: string; first_name?: string | null; last_name?: string | null }[] | null
}

interface ProgramsClientProps {
  templates: TemplateProgram[]
  assignedPrograms: AssignedProgram[]
}

// ── Composant principal ──────────────────────────────────────────────────────

export function ProgramsClient({ templates, assignedPrograms }: ProgramsClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [loading, setLoading] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const router = useRouter()

  // Calcule le nombre total de séances d'un modèle
  function countSessions(template: TemplateProgram): number {
    return template.weeks.reduce((total, week) => total + week.sessions.length, 0)
  }

  async function handleCreateTemplate() {
    if (!templateName.trim()) return
    setLoading(true)
    const result = await createTemplate(templateName.trim())
    setLoading(false)
    if (!result.error) {
      setTemplateName('')
      setShowCreateModal(false)
      router.refresh()
    }
  }

  async function handleRenameTemplate(programId: string) {
    if (!renameValue.trim()) return
    await renameTemplate(programId, renameValue.trim())
    setRenamingId(null)
    setRenameValue('')
    router.refresh()
  }

  async function handleDeleteTemplate(programId: string, name: string) {
    if (!confirm(`Supprimer le modèle "${name}" ? Cette action est irréversible.`)) return
    await deleteTemplate(programId)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Programmes</h1>
      </div>

      {/* ── Section 1 : Modèles de programmes ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Modèles de programmes</h2>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            + Créer un modèle
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-8 text-center">
            <p className="text-[#888] text-sm mb-4">
              Aucun modèle pour le moment. Crée un modèle pour l&apos;assigner à tes clients.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              + Créer mon premier modèle
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] p-4 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badge modèle */}
                    <span className="inline-block bg-[#d4ff00]/10 text-[#d4ff00] text-xs px-2 py-0.5 rounded-full mb-1 font-medium">
                      Modèle
                    </span>
                    {renamingId === template.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameTemplate(template.id)}
                          className="flex-1 px-2 py-1 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                          autoFocus
                        />
                        <button onClick={() => handleRenameTemplate(template.id)} className="text-xs text-[#d4ff00] hover:text-[#c2ee00]">OK</button>
                        <button onClick={() => setRenamingId(null)} className="text-xs text-[#888] hover:text-white">Annuler</button>
                      </div>
                    ) : (
                      <p className="font-semibold text-white truncate">{template.name}</p>
                    )}
                    {/* Stats du modèle */}
                    <p className="text-xs text-[#888] mt-0.5">
                      {template.weeks.length} semaine{template.weeks.length !== 1 ? 's' : ''} · {countSessions(template)} séance{countSessions(template) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setRenamingId(template.id); setRenameValue(template.name) }}
                      className="text-sm text-[#888] hover:text-white transition-colors"
                    >
                      Renommer
                    </button>
                    <Link
                      href={`/coach/programs/${template.id}`}
                      className="text-sm text-[#d4ff00] hover:text-[#c2ee00] font-medium transition-colors"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2 : Programmes assignés à des clients ─────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">Programmes assignés</h2>

        {assignedPrograms.length === 0 ? (
          <p className="text-[#888] text-sm py-4 text-center">
            Aucun programme assigné à un client pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {assignedPrograms.map((prog) => {
              // Normaliser la relation client (Supabase peut renvoyer un tableau ou un objet)
              const clientData = Array.isArray(prog.client) ? prog.client[0] : prog.client
              return (
                <div
                  key={prog.id}
                  className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{prog.name}</p>
                      <p className="text-xs text-[#888] mt-0.5">
                        {/* Affiche prénom + nom, repli sur full_name pour les anciens comptes */}
                        {clientData
                          ? (clientData.first_name && clientData.last_name)
                            ? `${clientData.first_name} ${clientData.last_name}`
                            : clientData.full_name
                          : 'Client inconnu'}
                      </p>
                    </div>
                    {/* Badge statut */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        prog.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-[#242424] text-[#888]'
                      }`}
                    >
                      {prog.status === 'active' ? 'Actif' : 'Terminé'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Modal de création de modèle ──────────────────────────────────── */}
      {showCreateModal && (
        <Modal title="Nouveau modèle de programme" onClose={() => { setShowCreateModal(false); setTemplateName('') }}>
          <div className="space-y-4">
            <Input
              label="Nom du modèle"
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Force – 4 semaines"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate} disabled={loading || !templateName.trim()} className="flex-1">
                {loading ? 'Création...' : 'Créer le modèle'}
              </Button>
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setTemplateName('') }}>
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
