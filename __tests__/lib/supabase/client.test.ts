import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocker le module @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('createBrowserClient', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('retourne un client Supabase', async () => {
    const { createBrowserClient } = await import('@/lib/supabase/client')
    const client = createBrowserClient()
    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
  })
})
