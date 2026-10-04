'use client'

// Liste des modèles de programmes et programmes assignés aux clients
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { createTemplate, deleteTemplate, renameTemplate } from './actions'

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

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name[0]?.toUpperCase() ?? '?'
}

export function ProgramsClient({ templates, assignedPrograms }: ProgramsClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [loading, setLoading] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const router = useRouter()

  function countSessions(template: TemplateProgram): number {
    return template.weeks.reduce((total, week) => total + week.sessions.length, 0)
  }

  async function handleCreateTemplate() {
    if (!templateName.trim()) return
    setLoading(true)
    const result = await createTemplate(templateName.trim())
    setLoading(false)
    if (!result.error) { setTemplateName(''); setShowCreateModal(false); router.refresh() }
  }

  async function handleRenameTemplate(programId: string) {
    if (!renameValue.trim()) return
    await renameTemplate(programId, renameValue.trim())
    setRenamingId(null); setRenameValue(''); router.refresh()
  }

  async function handleDeleteTemplate(programId: string, name: string) {
    if (!confirm(`Supprimer le modèle "${name}" ?`)) return
    await deleteTemplate(programId); router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>Programmes</h1>
      </div>

      {/* Modèles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Modèles
          </h2>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>+ Modèle</Button>
        </div>

        {templates.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[#888] text-sm mb-4">Aucun modèle pour le moment</p>
            <Button onClick={() => setShowCreateModal(true)}>+ Créer mon premier modèle</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div key={template.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#333] transition-all overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      {renamingId === template.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameTemplate(template.id)}
                            className="flex-1 px-2 py-1.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
                            autoFocus
                          />
                          <button onClick={() => handleRenameTemplate(template.id)} className="text-xs text-[#d4ff00] min-h-[44px] flex items-center">OK</button>
                          <button onClick={() => setRenamingId(null)} className="text-xs text-[#888] min-h-[44px] flex items-center">Annuler</button>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-white text-sm truncate">{template.name}</p>
                          <p className="text-xs text-[#888]">
                            {template.weeks.length} sem. · {countSessions(template)} séance{countSessions(template) !== 1 ? 's' : ''}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {renamingId !== template.id && (
                  <div className="flex border-t border-[#242424]">
                    <Link
                      href={`/coach/programs/${template.id}`}
                      className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#d4ff00] hover:bg-[#242424] transition-colors"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => { setRenamingId(template.id); setRenameValue(template.name) }}
                      className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#888] hover:text-white hover:bg-[#242424] transition-colors border-l border-[#242424]"
                    >
                      Renommer
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-xs font-medium text-[#555] hover:text-red-400 hover:bg-[#242424] transition-colors border-l border-[#242424]"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Programmes assignés */}
      <section>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Assignés à des clients
        </h2>

        {assignedPrograms.length === 0 ? (
          <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-6 text-center">
            <p className="text-[#888] text-sm">Aucun programme assigné</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedPrograms.map((prog) => {
              const clientData = Array.isArray(prog.client) ? prog.client[0] : prog.client
              const clientName = clientData
                ? (clientData.first_name && clientData.last_name)
                  ? `${clientData.first_name} ${clientData.last_name}`
                  : clientData.full_name
                : 'Client inconnu'
              return (
                <div key={prog.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center shrink-0">
                    <span className="text-[#888] font-bold text-xs">{getInitials(clientName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{prog.name}</p>
                    <p className="text-xs text-[#888]">{clientName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    prog.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-[#242424] text-[#888]'
                  }`}>
                    {prog.status === 'active' ? 'Actif' : 'Terminé'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {showCreateModal && (
        <Modal title="Nouveau modèle" onClose={() => { setShowCreateModal(false); setTemplateName('') }}>
          <div className="space-y-4">
            <Input
              label="Nom du modèle"
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Force — 4 semaines"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate} disabled={loading || !templateName.trim()} className="flex-1">
                {loading ? 'Création...' : 'Créer'}
              </Button>
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setTemplateName('') }}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
