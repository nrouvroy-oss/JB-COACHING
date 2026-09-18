'use client'

// Composant client pour la bibliothèque d'exercices — gère l'état et les interactions
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/coach/exercise-card'
import { ExerciseForm } from '@/components/coach/exercise-form'
import { deleteExercise } from './actions'
import type { Exercise } from '@/lib/types'

interface ExercisesPageClientProps {
  exercises: Exercise[]
}

export function ExercisesPageClient({ exercises }: ExercisesPageClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const router = useRouter()

  // Extraire les catégories uniques triées alphabétiquement
  const categories = [...new Set(exercises.map((e) => e.category))].sort()

  // Filtrer les exercices selon la catégorie sélectionnée
  const filtered = filterCategory === 'all'
    ? exercises
    : exercises.filter((e) => e.category === filterCategory)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    await deleteExercise(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Ajouter
        </Button>
      </div>

      {/* Filtre par catégorie — défilement horizontal sur mobile */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Liste des exercices ou message vide */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucun exercice. Ajoutez votre premier exercice !
        </p>
      ) : (
        <div className="space-y-4">
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
          onClose={() => { setShowForm(false); setEditingExercise(null) }}
        />
      )}
    </div>
  )
}
