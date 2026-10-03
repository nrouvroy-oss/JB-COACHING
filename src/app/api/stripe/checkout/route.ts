// API Route — crée une session Stripe Checkout pour l'abonnement Pro
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

  // Vérifier si le coach a déjà un customer Stripe
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  // Créer le customer Stripe si besoin
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { coach_id: user.id },
    })
    customerId = customer.id

    // Enregistrer le customer_id en base
    await admin.from('subscriptions').upsert({
      coach_id: user.id,
      stripe_customer_id: customerId,
      status: 'free',
    })
  }

  // Créer la session Checkout
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/coach?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/coach/clients`,
  })

  return NextResponse.json({ url: session.url })
}
