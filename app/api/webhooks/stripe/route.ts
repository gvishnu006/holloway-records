import { NextResponse } from 'next/server'

import { markPaid } from '@/lib/stripe/orders'
import { isDemoMode, stripe } from '@/lib/stripe/client'

/**
 * Stripe webhook.
 *
 * The only place that gets to say an order is paid, from Stripe's side of the
 * story. Signature verification is not optional and the raw body is required
 * for it, so the handler does not parse JSON before calling Stripe.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ received: true, mode: 'demo' })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'No webhook secret configured.' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const raw = await request.text()

  let event
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid signature'
    return NextResponse.json({ error: `Signature check failed: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object
      markPaid(session.id, session.customer_details?.email ?? session.customer_email ?? null)
      break
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      // Nothing to do: the order stays 'pending' and the record is still on
      // the shelf. A failed payment is not a sale.
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
