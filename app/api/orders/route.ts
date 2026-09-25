import { NextResponse } from 'next/server'

import { lookupOrder, markPaid } from '@/lib/stripe/orders'
import { isDemoMode, storefrontUrl, stripe } from '@/lib/stripe/client'

/**
 * Order lookup.
 *
 * GET  /api/orders?ref=HRW-XXXX-XXXX   find an order
 * PATCH /api/orders?ref=HRW-XXXX-XXXX  reconcile against Stripe
 *
 * The work happens in `lookupOrder`, because the order page does exactly the
 * same lookup while rendering. This route exists for the client component's
 * form, and for anything else that wants a receipt as JSON.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get('ref')?.trim()
  if (!ref) {
    return NextResponse.json({ error: 'Give us a reference to look up.' }, { status: 400 })
  }

  const order = await lookupOrder(ref)
  if (!order) {
    return NextResponse.json(
      { error: `No order with the reference ${ref.toUpperCase()}.` },
      { status: 404 },
    )
  }

  return NextResponse.json({ order })
}

/**
 * The success redirect can arrive before the webhook does, so the return trip
 * can nudge the reconciliation itself.
 */
export async function PATCH(request: Request) {
  const ref = new URL(request.url).searchParams.get('ref')?.trim().toUpperCase()
  if (!ref || isDemoMode()) {
    return NextResponse.json({ error: 'Nothing to reconcile.' }, { status: 400 })
  }

  try {
    const sessions = await stripe().checkout.sessions.list({ limit: 100 })
    const session = sessions.data.find((s) => s.client_reference_id === ref)
    if (!session) {
      return NextResponse.json({ error: 'No Stripe session for that reference.' }, { status: 404 })
    }
    const order = markPaid(session.id, session.customer_details?.email ?? null)
    return NextResponse.json({
      order: order ?? { reference: ref, status: 'paid' },
      site: storefrontUrl(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
