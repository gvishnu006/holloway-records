'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { RECORDS, type RecordItem } from '../catalog'
import { saveReceipt, type Receipt } from './receipt'

/**
 * The bag.
 *
 * The bag is persisted state, so it is modelled as persisted state: local
 * storage is the source of truth, `useSyncExternalStore` reads it, and every
 * mutation writes it and notifies. That gets three things for free —
 * the bag survives a reload, two tabs stay in agreement, and the server render
 * (which has no local storage) still agrees with the first paint.
 *
 * Everything that is *not* persisted — whether the drawer is open, the checkout
 * error, the counter bell — is ordinary component state.
 */

export type CartLine = { slug: string; qty: number }

const STORAGE_KEY = 'holloway.bag.v1'

const BY_SLUG = new Map(RECORDS.map((r) => [r.slug, r]))

/* ── The external store ─────────────────────────────────────────────────── */

const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // Another tab wrote to the bag; that is a store update too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

const readRaw = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

/** The server has no bag, and must not pretend otherwise. */
const serverRaw = () => ''

/**
 * Anything we cannot find in the catalogue, or any quantity above the stock we
 * actually have, is dropped. A bag is a wish list, not an order.
 */
function parse(raw: string): CartLine[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const merged = new Map<string, number>()
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue
      const { slug, qty } = entry as { slug?: unknown; qty?: unknown }
      if (typeof slug !== 'string' || typeof qty !== 'number' || !Number.isFinite(qty)) continue
      const record = BY_SLUG.get(slug)
      if (!record) continue
      const want = Math.max(1, Math.min(record.stock, Math.floor(qty)))
      merged.set(slug, Math.min(record.stock, (merged.get(slug) ?? 0) + want))
    }
    return [...merged].map(([slug, qty]) => ({ slug, qty }))
  } catch {
    return []
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Private browsing, or quota. The bag still works for this page view.
  }
  emit()
}

/* ── The context ────────────────────────────────────────────────────────── */

type CartState = {
  /** Is the receipt drawer open? */
  open: boolean
  /** Slug of the record whose "Add" button should light up. */
  pulse: string | null
  /** What happened, for the counter bell. */
  toast: { slug: string; token: number } | null
  /** Anything the customer should read before they leave. */
  notice: string | null
}

type CartApi = {
  lines: CartLine[]
  open: boolean
  count: number
  subtotal: number
  /** Slug of the record whose "Add" button should light up. */
  pulse: string | null
  /** Real records, resolved from the catalogue, with quantity. */
  detailed: Array<{ record: RecordItem; qty: number }>
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
  setOpen: (v: boolean) => void
  toggle: () => void
  /** What happens at the till. */
  checkout: () => Promise<void>
  checkingOut: boolean
  error: string | null
  toast: { slug: string; token: number } | null
  notice: string | null
  dismissNotice: () => void
}

const CartContext = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    open: false,
    pulse: null,
    toast: null,
    notice: null,
  })
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = useSyncExternalStore(subscribe, readRaw, serverRaw)
  const lines = useMemo(() => parse(raw), [raw])

  // The drawer locks the page behind it. This one really is an external system.
  useEffect(() => {
    document.body.style.overflow = state.open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [state.open])

  const add = useCallback((slug: string, qty = 1) => {
    const record = BY_SLUG.get(slug)
    if (!record) return

    const current = parse(readRaw())
    const existing = current.find((l) => l.slug === slug)
    const next = existing
      ? current.map((l) => (l.slug === slug ? { ...l, qty: Math.min(record.stock, l.qty + qty) } : l))
      : [...current, { slug, qty: Math.min(record.stock, qty) }]

    persist(next)
    setState((s) => ({
      ...s,
      pulse: slug,
      toast: { slug, token: Date.now() },
      // Only one copy exists, so say so rather than pretending the shop has
      // another one in a box somewhere.
      notice: existing && existing.qty >= record.stock ? `That is the only ${record.title} we have.` : null,
    }))

    window.setTimeout(() => setState((s) => ({ ...s, pulse: null })), 700)
  }, [])

  const dismissNotice = useCallback(() => setState((s) => ({ ...s, notice: null })), [])

  const setQty = useCallback((slug: string, qty: number) => {
    const record = BY_SLUG.get(slug)
    const current = parse(readRaw())
    const next =
      qty <= 0
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, qty: Math.min(record?.stock ?? qty, qty) } : l))
    persist(next)
  }, [])

  const remove = useCallback((slug: string) => {
    persist(parse(readRaw()).filter((l) => l.slug !== slug))
  }, [])

  const clear = useCallback(() => persist([]), [])

  const setOpen = useCallback((open: boolean) => setState((s) => ({ ...s, open })), [])
  const toggle = useCallback(() => setState((s) => ({ ...s, open: !s.open })), [])

  const detailed = useMemo(
    () =>
      lines.flatMap((line) => {
        const record = BY_SLUG.get(line.slug)
        return record ? [{ record, qty: line.qty }] : []
      }),
    [lines],
  )

  const count = useMemo(() => detailed.reduce((n, d) => n + d.qty, 0), [detailed])
  const subtotal = useMemo(() => detailed.reduce((n, d) => n + d.record.price * d.qty, 0), [detailed])

  const checkout = useCallback(async () => {
    setError(null)
    if (detailed.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lines: detailed.map((d) => ({ slug: d.record.slug, qty: d.qty })),
        }),
      })
      const data: { url?: string; error?: string; order?: Receipt } = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'The till would not take it. Try again.')
      // A demo receipt comes back with the redirect, because the ledger that
      // holds it does not survive a serverless hop.
      if (data.order) saveReceipt(data.order)
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong at the till.')
      setCheckingOut(false)
    }
  }, [detailed])

  const api = useMemo<CartApi>(
    () => ({
      lines,
      open: state.open,
      count,
      subtotal,
      pulse: state.pulse,
      detailed,
      add,
      setQty,
      remove,
      clear,
      setOpen,
      toggle,
      checkout,
      checkingOut,
      error,
      toast: state.toast,
      notice: state.notice,
      dismissNotice,
    }),
    [
      lines,
      state.open,
      state.pulse,
      state.toast,
      state.notice,
      count,
      subtotal,
      detailed,
      add,
      setQty,
      remove,
      clear,
      setOpen,
      toggle,
      checkout,
      checkingOut,
      error,
      dismissNotice,
    ],
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
