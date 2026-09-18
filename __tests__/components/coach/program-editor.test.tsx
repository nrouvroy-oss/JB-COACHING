import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramEditor } from '@/components/coach/program-editor'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ProgramEditor', () => {
  it("affiche un message si le programme n'a pas de semaines", () => {
    const program = {
      id: '1', name: 'Programme Test', client_id: 'c1', coach_id: 'co1',
      status: 'active' as const, created_at: '', weeks: [],
      client: { id: 'c1', email: 'c@t.com', full_name: 'Client Test', role: 'client' as const, created_at: '' },
    }

    render(<ProgramEditor program={program} exercises={[]} />)
    expect(screen.getByText(/ajouter une semaine/i)).toBeDefined()
  })
})
