import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

// Mocker le module supabase
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}))

// Mocker next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('LoginForm', () => {
  it('affiche les champs email et mot de passe', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/mot de passe/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDefined()
  })
})
