'use client'

// Formulaire d'ajout et d'édition d'exercice avec upload média et assignation aux programmes
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Exercise } from '@/lib/types'

// Catégories disponibles pour les exercices
const CATEGORIES = ['Haut du corps', 'Bas du corps', 'Cardio', 'Abdominaux', 'Étirements', 'Full body']

interface WorkoutOption {
  id: string
  name: string
  workout_exercises: { exercise_id: string }[]
}

interface ExerciseFormProps {
  onClose: () => void
  exercise?: Exercise | null
  workouts?: WorkoutOption[]
}

export function ExerciseForm({ onClose, exercise, workouts = [] }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [category, setCategory] = useState(exercise?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(exercise?.description ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEditing = !!exercise

  // Programmes sélectionnés — pré-cocher ceux qui contiennent déjà l'exercice
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>(
    exercise
      ? workouts.filter(w => w.workout_exercises.some(we => we.exercise_id === exercise.id)).map(w => w.id)
      : []
  )

  function toggleWorkout(workoutId: string) {
    setSelectedWorkouts(prev =>
      prev.includes(workoutId) ? prev.filter(id => id !== workoutId) : [...prev, workoutId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non connecté'); setLoading(false); return }

    let videoUrl = exercise?.video_url ?? ''

    // Upload du média si un fichier est sélectionné
    if (videoFile) {
      const fileExt = videoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, videoFile)

      if (uploadError) {
        setError('Erreur lors de l\'upload')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath)

      videoUrl = urlData.publicUrl
    }

    let exerciseId = exercise?.id

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ name, category, description, video_url: videoUrl })
        .eq('id', exercise.id)

      if (updateError) { setError('Erreur lors de la mise à jour'); setLoading(false); return }
    } else {
      const { data: newExercise, error: insertError } = await supabase
        .from('exercises')
        .insert({ name, category, description, video_url: videoUrl, coach_id: user.id })
        .select('id')
        .single()

      if (insertError || !newExercise) { setError('Erreur lors de la création'); setLoading(false); return }
      exerciseId = newExercise.id
    }

    // Gérer l'assignation aux programmes
    if (exerciseId) {
      // Programmes actuellement liés
      const currentWorkoutIds = workouts
        .filter(w => w.workout_exercises.some(we => we.exercise_id === exerciseId))
        .map(w => w.id)

      // Programmes à ajouter
      const toAdd = selectedWorkouts.filter(id => !currentWorkoutIds.includes(id))
      // Programmes à retirer
      const toRemove = currentWorkoutIds.filter(id => !selectedWorkouts.includes(id))

      // Ajouter aux nouveaux programmes
      for (const workoutId of toAdd) {
        // Prochain order_index
        const { data: existing } = await supabase
          .from('workout_exercises')
          .select('order_index')
          .eq('workout_id', workoutId)
          .order('order_index', { ascending: false })
          .limit(1)

        const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

        await supabase.from('workout_exercises').insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          order_index: nextIndex,
          coach_notes: '',
        })
      }

      // Retirer des programmes désélectionnés
      for (const workoutId of toRemove) {
        await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_id', workoutId)
          .eq('exercise_id', exerciseId)
      }
    }

    router.refresh()
    onClose()
  }

  return (
    <Modal title={isEditing ? 'Modifier l\'exercice' : 'Nouvel exercice'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Squat, Pompes..." />
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Catégorie</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white text-sm transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sélection des programmes */}
        {workouts.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Programmes</label>
            <div className="flex flex-wrap gap-2">
              {workouts.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWorkout(w.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedWorkouts.includes(w.id)
                      ? 'bg-[#d4ff00] text-black'
                      : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors"
            placeholder="Consignes, points d'attention..."
          />
        </div>
        <div>
          <label htmlFor="video" className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
            Média (optionnel) {isEditing && '— laisser vide pour garder l\'actuel'}
          </label>
          <p className="text-xs text-[#555] mb-1.5">Vidéo, image ou PDF</p>
          <input
            id="video"
            type="file"
            accept="video/mp4,video/quicktime,image/jpeg,image/png,application/pdf"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-[#888] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#d4ff00]/10 file:text-[#d4ff00] file:font-medium"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
      </form>
    </Modal>
  )
}
