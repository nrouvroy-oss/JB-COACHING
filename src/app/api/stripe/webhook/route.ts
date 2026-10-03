// API Route — reçoit les événements Stripe (paiement, annulation, etc.)
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    // Abonnement créé ou mis à jour
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      const periodEnd = (sub as any).current_period_end
      await admin.from('subscriptions').update({
        stripe_subscription_id: sub.id,
        status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId)

      break
    }

    // Abonnement annulé
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      await admin.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
