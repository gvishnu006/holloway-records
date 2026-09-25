'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { SleeveArt } from './SleeveArt'
import { POSTAGE, FREE_POSTAGE_OVER } from '@/lib/commerce'
import { cx, money, pluralRecords } from '@/lib/format'
import { useCart } from '@/lib/store/cart'

/**
 * The receipt drawer.
 *
 * A shop bag is not a checkout funnel; it is a receipt you have not paid for
 * yet. So it looks like a docket: line items, a subtotal, postage, and a
 * single amber button. The quantity stepper is the only clever thing in here.
 */
export function CartDrawer() {
  const { open, setOpen, detailed, count, subtotal, setQty, remove, clear, checkout, checkingOut, error } =
    useCart()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const postage = subtotal === 0 || subtotal >= FREE_POSTAGE_OVER ? 0 : POSTAGE
  const total = subtotal + postage
  const toFreePostage = Math.max(0, FREE_POSTAGE_OVER - subtotal)

  // Escape closes, and focus moves into the drawer so the keyboard is not
  // left behind on the page underneath.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length < 2) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Your bag">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="animate-scrim absolute inset-0 h-full w-full cursor-default bg-void/72"
        aria-label="Close the bag"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        className="animate-drawer grain-heavy absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-paper/12 bg-sleeve"
      >
        <header className="flex items-center justify-between border-b border-paper/10 px-6 py-5">
          <div>
            <h2 className="display-md text-2xl text-paper">Your bag</h2>
            <p className="runin mt-1">{count === 0 ? 'Empty' : pluralRecords(count)}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-ghost btn-sm"
          >
            Close
          </button>
        </header>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="display-md text-2xl text-paper">Nothing in here yet.</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-dim">
              Go back to the crate. Everything on the shelf is one copy — when it is gone, it is
              gone.
            </p>
            <Link href="/" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm mt-7">
              Back to the crate
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {detailed.map(({ record, qty }) => (
                <li key={record.slug} className="flex gap-4 border-b border-paper/8 py-5 last:border-0">
                  <Link
                    href={`/records/${record.slug}`}
                    onClick={() => setOpen(false)}
                    className="sleeve-surface h-20 w-20 shrink-0 overflow-hidden"
                  >
                    <SleeveArt cover={record.cover} title={record.title} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/records/${record.slug}`}
                        onClick={() => setOpen(false)}
                        className="truncate text-sm text-paper hover:text-amber"
                      >
                        {record.title}
                      </Link>
                      <span className="shrink-0 font-mono text-sm text-paper">
                        {money(record.price * qty)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-paper-faint">
                      {record.artist} · {record.condition.vinyl} vinyl
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border border-paper/15">
                        <button
                          type="button"
                          onClick={() => setQty(record.slug, qty - 1)}
                          className="px-2.5 py-1 font-mono text-xs text-paper-dim transition-colors hover:bg-paper/8 hover:text-paper"
                          aria-label={qty === 1 ? `Remove ${record.title}` : `One fewer ${record.title}`}
                        >
                          −
                        </button>
                        <span
                          className="min-w-7 text-center font-mono text-xs text-paper"
                          aria-live="polite"
                        >
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(record.slug, qty + 1)}
                          disabled={qty >= record.stock}
                          className="px-2.5 py-1 font-mono text-xs text-paper-dim transition-colors hover:bg-paper/8 hover:text-paper disabled:opacity-30"
                          aria-label={`One more ${record.title}`}
                        >
                          +
                        </button>
                      </div>

                      {qty >= record.stock && (
                        <span className="stamp text-amber">All we have</span>
                      )}

                      <button
                        type="button"
                        onClick={() => remove(record.slug)}
                        className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-ghost transition-colors hover:text-rust"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-paper/10 px-6 py-5">
              <dl className="space-y-2">
                <Row label="Subtotal" value={money(subtotal)} />
                <Row
                  label="Postage"
                  value={postage === 0 ? 'Free' : money(postage)}
                  hint={toFreePostage > 0 ? `${money(toFreePostage)} to free postage` : undefined}
                />
                <div className="flex items-baseline justify-between border-t border-paper/10 pt-3">
                  <dt className="cat text-paper">Total</dt>
                  <dd className="display-md text-2xl text-paper">{money(total)}</dd>
                </div>
              </dl>

              {error && (
                <p role="alert" className="mt-4 border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-rust">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => void checkout()}
                disabled={checkingOut}
                className="btn btn-amber mt-5 w-full"
              >
                {checkingOut ? 'Taking you to the till…' : `Pay ${money(total)}`}
              </button>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-paper-faint">
                  Posted Tuesday to Friday, Royal Mail 48h.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className={cx(
                    'font-mono text-[0.625rem] uppercase tracking-[0.14em]',
                    'text-paper-ghost transition-colors hover:text-rust',
                  )}
                >
                  Empty the bag
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-sm text-paper-dim">
        {label}
        {hint && <span className="ml-2 font-mono text-[0.625rem] text-paper-ghost">{hint}</span>}
      </dt>
      <dd className="font-mono text-sm text-paper-dim">{value}</dd>
    </div>
  )
}
