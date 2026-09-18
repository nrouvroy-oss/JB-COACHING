'use client'

// Formulaire d'ajout et d'édition d'exercice avec upload vidéo
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Exercise } from '@/lib/types'

// Catégories disponibles pour les exercices
const CATEGORIES = ['Haut du corps', 'Bas du corps', 'Cardio', 'Abdominaux', 'Étirements', 'Full body']

interface ExerciseFormProps {
  onClose: () => void
  exercise?: Exercise | null
}

export function ExerciseForm({ onClose, exercise }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [category, setCategory] = useState(exercise?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(exercise?.description ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEditing = !!exercise

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non connecté'); setLoading(false); return }

    let videoUrl = exercise?.video_url ?? ''

    // Upload de la vidéo si un fichier est sélectionné
    if (videoFile) {
      const fileExt = videoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, videoFile)

      if (uploadError) {
        setError('Erreur lors de l\'upload de la vidéo')
        setLoading(false)
        return
      }

      // Récupérer l'URL publique de la vidéo uploadée
      const { data: urlData } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath)

      videoUrl = urlData.publicUrl
    }

    if (isEditing) {
      // Mise à jour d'un exercice existant
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ name, category, description, video_url: videoUrl })
        .eq('id', exercise.id)

      if (updateError) { setError('Erreur lors de la mise à jour'); setLoading(false); return }
    } else {
      // Une vidéo est obligatoire pour un nouvel exercice
      if (!videoFile) { setError('Veuillez sélectionner une vidéo'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('exercises')
        .insert({ name, category, description, video_url: videoUrl, coach_id: user.id })

      if (insertError) { setError('Erreur lors de la création'); setLoading(false); return }
    }

    router.refresh()
    onClose()
  }

  return (
    <Modal title={isEditing ? 'Modifier l\'exercice' : 'Nouvel exercice'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Squat, Pompes..." />
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Consignes, points d'attention..."
          />
        </div>
        <div>
          <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
            Vidéo {isEditing && '(laisser vide pour garder l\'actuelle)'}
          </label>
          <input
            id="video"
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
      </form>
    </Modal>
  )
}
