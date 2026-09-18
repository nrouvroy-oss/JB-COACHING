import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseForm } from '@/components/coach/exercise-form'

// Mock du client Supabase navigateur
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    storage: { from: () => ({ upload: vi.fn() }) },
    from: () => ({ insert: vi.fn().mockReturnValue({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
  }),
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ExerciseForm', () => {
  it('affiche les champs nom, catégorie, description et vidéo', () => {
    render(<ExerciseForm onClose={() => {}} />)
    expect(screen.getByLabelText(/nom/i)).toBeDefined()
    expect(screen.getByLabelText(/catégorie/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByLabelText(/vidéo/i)).toBeDefined()
  })
})
