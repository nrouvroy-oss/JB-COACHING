import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientCard } from '@/components/coach/client-card'

describe('ClientCard', () => {
  const client = {
    id: '123',
    email: 'client@test.com',
    full_name: 'Jean Dupont',
    role: 'client' as const,
    created_at: '2026-01-01',
  }

  it('affiche le nom du client et son pourcentage de progression', () => {
    render(<ClientCard client={client} programStatus="active" completionPercent={75} />)
    expect(screen.getByText('Jean Dupont')).toBeDefined()
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('affiche "Aucun programme" si pas de programme actif', () => {
    render(<ClientCard client={client} programStatus={null} completionPercent={0} />)
    expect(screen.getByText(/aucun programme/i)).toBeDefined()
  })
})
