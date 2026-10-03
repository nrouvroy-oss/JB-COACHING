'use client'

// Bibliothèque d'exercices — recherche, filtres par catégorie, programme et source
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/coach/exercise-card'
import { ExerciseForm } from '@/components/coach/exercise-form'
import { deleteExercise, duplicateExercise } from './actions'
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
  const [filterSource, setFilterSource] = useState<'all' | 'standard' | 'mine'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20
  const router = useRouter()

  // Catégories uniques
  const categories = [...new Set(exercises.map((e) => e.category))].sort()

  // IDs des exercices du programme sélectionné
  const workoutExerciseIds = filterWorkout !== 'all'
    ? new Set(workouts.find(w => w.id === filterWorkout)?.workout_exercises.map(we => we.exercise_id) ?? [])
    : null

  // Filtrage combiné : recherche + catégorie + programme + source
  const filtered = exercises.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    if (workoutExerciseIds && !workoutExerciseIds.has(e.id)) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSource === 'standard' && e.coach_id !== null) return false
    if (filterSource === 'mine' && e.coach_id === null) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    await deleteExercise(id)
    router.refresh()
  }

  async function handleDuplicate(exercise: Exercise) {
    await duplicateExercise(exercise.id)
    router.refresh()
  }

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Exercices</h1>
        <Button onClick={() => setShowForm(true)} size="sm">+ Ajouter</Button>
      </div>

      {/* Tabs source — segmented control */}
      <div className="flex bg-[#1c1c1c] rounded-lg p-0.5 mb-3">
        {(['all', 'standard', 'mine'] as const).map((source) => (
          <button
            key={source}
            onClick={() => { setFilterSource(source); setPage(1) }}
            className={`flex-1 py-3 min-h-[44px] text-sm font-semibold rounded-md transition-all ${
              filterSource === source
                ? 'bg-[#d4ff00] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            {source === 'all' ? `Tous (${exercises.length})` : source === 'standard' ? `Base (${exercises.filter(e => e.coach_id === null).length})` : `Perso (${exercises.filter(e => e.coach_id !== null).length})`}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        placeholder="Rechercher..."
        aria-label="Rechercher un exercice"
        className="w-full px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4ff00] placeholder:text-[#777] mb-2"
      />

      {/* Filtres catégorie + programme */}
      <div className="flex gap-2 mb-3">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          className="flex-1 px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-[#888] focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {workouts.length > 0 && (
          <select
            value={filterWorkout}
            onChange={(e) => { setFilterWorkout(e.target.value); setPage(1) }}
            className="flex-1 px-3 py-3 min-h-[44px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-sm text-[#888] focus:outline-none focus:ring-1 focus:ring-[#d4ff00]"
          >
            <option value="all">Tous les programmes</option>
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Compteur de résultats */}
      <p className="text-xs text-[#888] mb-3">{filtered.length} exercice{filtered.length !== 1 ? 's' : ''}</p>

      {/* Liste des exercices */}
      {filtered.length === 0 ? (
        <p className="text-[#888] text-center py-12">
          {exercises.length === 0 ? 'Aucun exercice. Ajoutez votre premier exercice !' : 'Aucun résultat'}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={(ex) => { setEditingExercise(ex); setShowForm(true) }}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-11 h-11 rounded-lg text-sm font-medium bg-[#242424] text-[#888] hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Page précédente"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-11 h-11 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    page === p ? 'bg-[#d4ff00] text-black' : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-11 h-11 rounded-lg text-sm font-medium bg-[#242424] text-[#888] hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Page suivante"
              >
                →
              </button>
            </div>
          )}
        </>
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
