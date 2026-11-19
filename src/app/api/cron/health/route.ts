// Route keepalive — pingée quotidiennement pour éviter la pause Supabase (plan gratuit)
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerClient()

  // Requête légère pour garder le projet Supabase actif
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ok',
    profiles: count,
    timestamp: new Date().toISOString(),
  })
}
