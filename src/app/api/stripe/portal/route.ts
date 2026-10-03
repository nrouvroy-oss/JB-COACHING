// API Route — ouvre le portail client Stripe (gérer/annuler l'abonnement)
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'Pas d\'abonnement' }, { status: 400 })
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/coach/profil`,
  })

  return NextResponse.json({ url: session.url })
}
