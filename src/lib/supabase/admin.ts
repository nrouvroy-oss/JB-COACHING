// Client admin Supabase pour les opérations privilégiées (création de comptes)
// Ne jamais utiliser côté client - réservé aux Server Actions sécurisées
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
