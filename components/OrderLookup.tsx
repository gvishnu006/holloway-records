'use client'

import { useEffect, useState } from 'react'

import { money } from '@/lib/format'
import { readReceipt } from '@/lib/store/receipt'

/**
 * "Where is my order?"
 *
 * A real shop answers that on the phone, and this is the web version: type the
 * reference from the confirmation email, get the order back.
 *
 * Coming back from the till lands on a URL with the reference in it. The server
 * does that lookup while rendering, which is what makes a real order appear
 * with no JavaScript at all. A demo order — the one minted by /api/checkout when
 * the shop has no Stripe key — lives in the ledger of the checkout handler, so
 * the page asks /api/orders for it once it is running. Either way there is one
 * lookup, and the receipt is on screen.
 *
 * The form is here for the other half of the job: looking an order up later,
 * when you have lost the email.
 */

type OrderPayload = {
  reference: string
  status: 'pending' | 'paid' | 'demo'
  email: string | null
  placedAt: string
  subtotal: number
  postage: number
  total: number
  lines: Array<{ slug: string; qty: number; title: string; price: number }>
}

type Props = {
  /** From ?ref=…, if the customer is coming back from the till. */
  initialRef?: string
  /** What the server found for that reference, or null. */
  initialOrder?: OrderPayload | null
  /** True when the server looked for that reference and could not find it. */
  initialMissing?: boolean
}

type LookupState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'error'; message: string }
  | { kind: 'found'; order: OrderPayload }

export function OrderLookup({ initialRef = '', initialOrder, initialMissing }: Props) {
  const [reference, setReference] = useState(initialRef)
  const [state, setState] = useState<LookupState>(() => {
    if (initialOrder) return { kind: 'found', order: initialOrder }
    if (initialMissing) return { kind: 'loading' }
    return { kind: 'idle' }
  })

  // The server looked, and did not find it. Two other places might know:
  // the browser kept the demo receipt from the checkout response, and the API
  // shares a ledger with the checkout handler. Ask both before saying no.
  useEffect(() => {
    if (!initialRef || initialOrder || !initialMissing) return
    let live = true

    // Resolving through a promise keeps every setState out of the effect body,
    // even the one that is already answered.
    const fromBrowser = Promise.resolve(readReceipt(initialRef))

    fromBrowser
      .then((cached) =>
        cached ? cached : fetch(`/api/orders?ref=${encodeURIComponent(initialRef)}`, { cache: 'no-store' })
          .then((res) => (res.status === 404 ? Promise.resolve(null) : res.json()))
          .then((data: { order?: OrderPayload; error?: string } | null) => data?.order ?? null),
      )
      .then((order: OrderPayload | null) => {
        if (!live) return
        if (order) return setState({ kind: 'found', order })
        setState({ kind: 'missing' })
      })
      .catch(() => {
        if (live) setState({ kind: 'error', message: 'No connection to the shop.' })
      })

    return () => {
      live = false
    }
  }, [initialRef, initialOrder, initialMissing])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ref = reference.trim().toUpperCase()
    if (!ref) return

    setState({ kind: 'loading' })
    try {
      const res = await fetch(`/api/orders?ref=${encodeURIComponent(ref)}`, { cache: 'no-store' })
      const data: { order?: OrderPayload; error?: string } = await res.json()

      if (res.status === 404) return setState({ kind: 'missing' })
      if (!res.ok || !data.order) {
        return setState({ kind: 'error', message: data.error ?? 'The ledger would not open.' })
      }
      setState({ kind: 'found', order: data.order })
    } catch {
      setState({ kind: 'error', message: 'No connection to the shop. Try again in a moment.' })
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="order-ref" className="runin">
            Your reference
          </label>
          <input
            id="order-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="HRW-4K7Q-92MX"
            autoComplete="off"
            spellCheck={false}
            className="mt-2 w-full border-b border-paper/20 bg-transparent pb-2 font-mono text-lg uppercase tracking-[0.1em] text-paper placeholder:text-paper-ghost focus:border-amber focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={state.kind === 'loading' || reference.trim().length === 0}
          className="btn btn-amber"
        >
          {state.kind === 'loading' ? 'Looking…' : 'Find it'}
        </button>
      </form>

      <div aria-live="polite" className="mt-8">
        {state.kind === 'missing' && (
          <p className="border-l-2 border-rust/60 pl-4 text-sm leading-relaxed text-paper-dim">
            No order with that reference. Check the email we sent, or call the counter on
            0117 496 0141 and we will look it up by name.
          </p>
        )}

        {state.kind === 'error' && (
          <p className="border-l-2 border-rust/60 pl-4 text-sm text-paper-dim">{state.message}</p>
        )}

        {state.kind === 'found' && <OrderReceipt order={state.order} />}
      </div>
    </div>
  )
}

function OrderReceipt({ order }: { order: OrderPayload }) {
  const placed = new Date(order.placedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="animate-pop border border-paper/12 bg-sleeve p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper/10 pb-4">
        <div>
          <p className="runin">Order</p>
          <p className="mt-1 font-mono text-lg text-paper">{order.reference}</p>
        </div>
        <span
          className={
            order.status === 'demo'
              ? 'stamp text-amber'
              : order.status === 'paid'
                ? 'stamp text-mint'
                : 'stamp text-paper-dim'
          }
        >
          {order.status === 'demo' ? 'Demo order' : order.status === 'paid' ? 'Paid' : 'Awaiting payment'}
        </span>
      </div>

      <p className="mt-4 text-sm text-paper-faint">Placed {placed}</p>

      {order.lines.length > 0 && (
        <ul className="mt-5 space-y-3">
          {order.lines.map((l) => (
            <li key={l.slug} className="flex items-baseline gap-3">
              <span className="cat w-8 shrink-0 text-paper-ghost">{l.qty}×</span>
              <span className="min-w-0 flex-1 truncate text-sm text-paper-dim">{l.title}</span>
              <span className="shrink-0 font-mono text-sm text-paper-dim">{money(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-1.5 border-t border-paper/10 pt-4">
        <div className="flex justify-between">
          <dt className="text-sm text-paper-faint">Subtotal</dt>
          <dd className="font-mono text-sm text-paper-dim">{money(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-paper-faint">Postage</dt>
          <dd className="font-mono text-sm text-paper-dim">
            {order.postage === 0 ? 'Free' : money(order.postage)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-paper/10 pt-2">
          <dt className="cat">Total</dt>
          <dd className="display-md text-xl text-paper">{money(order.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
