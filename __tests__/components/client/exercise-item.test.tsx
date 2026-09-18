import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseItem } from '@/components/client/exercise-item'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ExerciseItem', () => {
  const sessionExercise = {
    id: 'se1',
    session_id: 's1',
    exercise_id: 'e1',
    sets: 4,
    reps: '12',
    rest_seconds: 60,
    coach_notes: 'Garde le dos droit',
    order_index: 0,
    exercise: {
      id: 'e1', name: 'Squat', description: 'Flexion de jambes',
      video_url: 'https://example.com/video.mp4', category: 'Bas du corps',
      coach_id: 'c1', created_at: '',
    },
    exercise_log: null,
  }

  it('affiche le nom de l\'exercice et les détails', () => {
    render(<ExerciseItem sessionExercise={sessionExercise} clientId="client1" />)
    expect(screen.getByText('Squat')).toBeDefined()
    expect(screen.getByText(/4x12/)).toBeDefined()
    expect(screen.getByText(/60s/)).toBeDefined()
    expect(screen.getByText(/Garde le dos droit/)).toBeDefined()
  })
})
