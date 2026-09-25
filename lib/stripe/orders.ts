import 'server-only'

import { isDemoMode, stripe } from './client'
import { RECORDS, getRecord, type RecordItem } from '../catalog'

/**
 * Orders, in the least glamorous way possible.
 *
 * In-memory so the demo needs no database, with the Stripe session id
 * alongside it so a real webhook can be reconciled later. Swap the ledger for a
 * table and the rest of the code does not care.
 *
 * The ledger hangs off `globalThis` rather than module scope on purpose: a
 * Route Handler and the page that renders the receipt are separate server
 * bundles, so a module-level Map would be two different ledgers, and the demo
 * order would be invisible the moment you followed the redirect. On a serverless
 * platform this is per-instance either way — which is exactly why every real
 * order is reconciled against Stripe, the only durable copy.
 */

export type StoredOrder = {
  reference: string
  stripeSessionId: string | null
  email: string | null
  lines: Array<{ slug: string; qty: number; title: string; price: number }>
  subtotal: number
  postage: number
  total: number
  placedAt: string
  status: 'pending' | 'paid' | 'demo'
}

type Ledger = {
  orders: Map<string, StoredOrder>
  bySession: Map<string, string>
}

const GLOBAL_KEY = '__hollowayOrders'

function ledger(): Ledger {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Ledger }
  g[GLOBAL_KEY] ??= { orders: new Map(), bySession: new Map() }
  return g[GLOBAL_KEY]
}

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no 0/O/1/I

/** HRW-4K7Q-92MX. Short enough to read down a phone, hard enough to guess. */
export function newReference(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  const body = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length] ?? 'X').join('')
  return `HRW-${body.slice(0, 4)}-${body.slice(4)}`
}

export type PricedLine = { record: RecordItem; qty: number }

/**
 * Resolve a client-supplied basket against the real catalogue.
 *
 * Prices, titles and stock all come from here and never from the request body,
 * so a tampered client cannot buy a Blue Meridian Quintet for a penny.
 */
export function priceBasket(input: unknown): { lines: PricedLine[]; subtotal: number } | { error: string } {
  if (!Array.isArray(input)) return { error: 'Your bag did not look like a bag.' }
  if (input.length === 0) return { error: 'There is nothing in the bag.' }
  if (input.length > 20) return { error: 'That is more than we will post in one parcel.' }

  const lines: PricedLine[] = []

  for (const raw of input) {
    if (typeof raw !== 'object' || raw === null) return { error: 'One of those lines was unreadable.' }
    const { slug, qty } = raw as { slug?: unknown; qty?: unknown }
    if (typeof slug !== 'string') return { error: 'One of those lines had no record in it.' }

    const record = getRecord(slug)
    if (!record) return { error: `We no longer have ${slug} — it may have sold.` }

    const want = typeof qty === 'number' && Number.isFinite(qty) ? Math.floor(qty) : 1
    const take = Math.max(1, Math.min(record.stock, want))
    const existing = lines.find((l) => l.record.slug === slug)
    if (existing) existing.qty = Math.min(record.stock, existing.qty + take)
    else lines.push({ record, qty: take })
  }

  const subtotal = lines.reduce((n, l) => n + l.record.price * l.qty, 0)
  return { lines, subtotal }
}

export function recordOrder(order: StoredOrder): StoredOrder {
  const { orders, bySession } = ledger()
  orders.set(order.reference, order)
  if (order.stripeSessionId) bySession.set(order.stripeSessionId, order.reference)
  return order
}

export function findOrder(reference: string): StoredOrder | undefined {
  return ledger().orders.get(reference.trim().toUpperCase())
}

export function findBySession(sessionId: string): StoredOrder | undefined {
  const { orders, bySession } = ledger()
  const ref = bySession.get(sessionId)
  return ref ? orders.get(ref) : undefined
}

export function markPaid(sessionId: string, email?: string | null): StoredOrder | undefined {
  const order = findBySession(sessionId)
  if (!order) return undefined
  order.status = 'paid'
  if (email) order.email = email
  return order
}

/**
 * The one lookup, wherever it is called from.
 *
 * The local ledger first, because that is instant. Then Stripe, because on
 * serverless the instance that took the order is not necessarily the instance
 * answering the question — and Stripe is the only durable copy we have. The
 * SDK cannot filter on client_reference_id, so we page the most recent
 * sessions and match the reference ourselves.
 */
export async function lookupOrder(reference: string): Promise<StoredOrder | null> {
  const ref = reference.trim().toUpperCase()
  if (!ref) return null

  const local = findOrder(ref)

  if (local && local.stripeSessionId && !isDemoMode()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(local.stripeSessionId)
      if (session.payment_status === 'paid' && local.status !== 'paid') {
        return markPaid(session.id, session.customer_details?.email ?? session.customer_email ?? null) ?? local
      }
      return local
    } catch {
      // Stripe is having a moment; the local copy is still worth showing.
      return local
    }
  }

  if (local) return local
  if (isDemoMode()) return null

  try {
    const sessions = await stripe().checkout.sessions.list({ limit: 100 })
    const session = sessions.data.find((s) => s.client_reference_id === ref)
    if (!session) return null

    const subtotal = session.amount_subtotal ?? 0
    const total = session.amount_total ?? 0
    return {
      reference: ref,
      stripeSessionId: session.id,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      lines: [],
      subtotal,
      postage: Math.max(0, total - subtotal),
      total,
      placedAt: new Date(session.created * 1000).toISOString(),
      status: session.payment_status === 'paid' ? 'paid' : 'pending',
    }
  } catch {
    return null
  }
}

/** Every record we have ever listed, for the sitemap. */
export function allRecords(): RecordItem[] {
  return RECORDS
}
