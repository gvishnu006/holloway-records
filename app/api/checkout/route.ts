import { NextResponse } from 'next/server'

import { priceBasket, newReference, recordOrder, type StoredOrder } from '@/lib/stripe/orders'
import { postageFor } from '@/lib/commerce'
import { isDemoMode, storefrontUrl, stripe } from '@/lib/stripe/client'

/**
 * The till.
 *
 * A Next.js Route Handler rather than a separate service, so the shop is one
 * deployment with one set of environment variables. In demo mode (no Stripe
 * key) it still returns a working URL — the local receipt page — so the whole
 * flow can be reviewed on a fresh clone.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'We could not read that order.' }, { status: 400 })
  }

  const basket = priceBasket((body as { lines?: unknown } | null)?.lines)
  if ('error' in basket) {
    return NextResponse.json({ error: basket.error }, { status: 400 })
  }

  const { lines, subtotal } = basket
  const postage = postageFor(subtotal)
  const total = subtotal + postage
  const email =
    typeof (body as { email?: unknown } | null)?.email === 'string'
      ? ((body as { email: string }).email.slice(0, 200) || null)
      : null

  const reference = newReference()
  const base = storefrontUrl()

  if (isDemoMode()) {
    const order: StoredOrder = {
      reference,
      stripeSessionId: null,
      email,
      lines: lines.map((l) => ({
        slug: l.record.slug,
        qty: l.qty,
        title: l.record.title,
        price: l.record.price,
      })),
      subtotal,
      postage,
      total,
      placedAt: new Date().toISOString(),
      status: 'demo',
    }
    recordOrder(order)

    return NextResponse.json({
      url: `${base}/order?ref=${encodeURIComponent(reference)}&demo=1`,
      reference,
      demo: true,
    })
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email ?? undefined,
      client_reference_id: reference,
      success_url: `${base}/order?ref=${encodeURIComponent(reference)}&paid=1`,
      cancel_url: `${base}/?cancelled=1`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['GB', 'IE'] },
      shipping_options:
        postage === 0
          ? undefined
          : [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: postage, currency: 'gbp' },
                  display_name: 'Royal Mail 48h',
                  delivery_estimate: { minimum: { unit: 'business_day', value: 2 } },
                },
              },
            ],
      metadata: { reference },
      line_items: lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: 'gbp',
          unit_amount: l.record.price,
          product_data: {
            name: `${l.record.artist} — ${l.record.title}`,
            description: `${l.record.label} ${l.record.catalogNumber} · ${l.record.condition.vinyl} vinyl / ${l.record.condition.sleeve} sleeve`,
            metadata: { slug: l.record.slug },
          },
        },
      })),
    })

    recordOrder({
      reference,
      stripeSessionId: session.id,
      email,
      lines: lines.map((l) => ({
        slug: l.record.slug,
        qty: l.qty,
        title: l.record.title,
        price: l.record.price,
      })),
      subtotal,
      postage,
      total,
      placedAt: new Date().toISOString(),
      status: 'pending',
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not give us a checkout link.' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url, reference, demo: false })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe error'
    return NextResponse.json({ error: `The till would not open: ${message}` }, { status: 502 })
  }
}
