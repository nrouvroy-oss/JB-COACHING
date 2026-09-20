'use client'

// Bibliothèque d'exercices — recherche, filtres par catégorie et par programme
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/coach/exercise-card'
import { ExerciseForm } from '@/components/coach/exercise-form'
import { deleteExercise } from './actions'
import type { Exercise } from '@/lib/types'

interface WorkoutInfo {
  id: string
  name: string
  workout_exercises: { exercise_id: string }[]
}

interface ExercisesPageClientProps {
  exercises: Exercise[]
  workouts: WorkoutInfo[]
}

export function ExercisesPageClient({ exercises, workouts }: ExercisesPageClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterWorkout, setFilterWorkout] = useState<string>('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Catégories uniques
  const categories = [...new Set(exercises.map((e) => e.category))].sort()

  // IDs des exercices du programme sélectionné
  const workoutExerciseIds = filterWorkout !== 'all'
    ? new Set(workouts.find(w => w.id === filterWorkout)?.workout_exercises.map(we => we.exercise_id) ?? [])
    : null

  // Filtrage combiné : recherche + catégorie + programme
  const filtered = exercises.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    if (workoutExerciseIds && !workoutExerciseIds.has(e.id)) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    await deleteExercise(id)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Exercices</h1>
        <Button onClick={() => setShowForm(true)} size="sm">+ Ajouter</Button>
      </div>

      {/* Barre de recherche */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un exercice..."
        className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777] mb-3"
      />

      {/* Filtre par programme */}
      {workouts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          <button
            onClick={() => setFilterWorkout('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
              filterWorkout === 'all' ? 'bg-[#d4ff00] text-black' : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
            }`}
          >
            Tous les programmes
          </button>
          {workouts.map((w) => (
            <button
              key={w.id}
              onClick={() => setFilterWorkout(filterWorkout === w.id ? 'all' : w.id)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                filterWorkout === w.id ? 'bg-[#d4ff00] text-black' : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Filtre par catégorie */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
              filterCategory === 'all' ? 'bg-[#d4ff00]/20 text-[#d4ff00]' : 'bg-[#242424] text-[#555] hover:bg-[#2a2a2a]'
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                filterCategory === cat ? 'bg-[#d4ff00]/20 text-[#d4ff00]' : 'bg-[#242424] text-[#555] hover:bg-[#2a2a2a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Compteur de résultats */}
      <p className="text-xs text-[#888] mb-3">{filtered.length} exercice{filtered.length !== 1 ? 's' : ''}</p>

      {/* Liste des exercices */}
      {filtered.length === 0 ? (
        <p className="text-[#888] text-center py-12">
          {exercises.length === 0 ? 'Aucun exercice. Ajoutez votre premier exercice !' : 'Aucun résultat'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={(ex) => { setEditingExercise(ex); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'ajout / édition */}
      {showForm && (
        <ExerciseForm
          exercise={editingExercise}
          workouts={workouts}
          onClose={() => { setShowForm(false); setEditingExercise(null) }}
        />
      )}
    </div>
  )
}
