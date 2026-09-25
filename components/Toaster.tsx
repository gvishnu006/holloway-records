'use client'

import { useEffect, useState } from 'react'

import { getRecord } from '@/lib/catalog'
import { cx } from '@/lib/format'
import { useCart } from '@/lib/store/cart'

/**
 * The counter bell.
 *
 * When something goes in the bag, a small line of type slides up from the
 * bottom-left and tells you what happened. Nothing fancy, nothing that
 * announces itself for five seconds. If a shelf only had one copy, the bell
 * also says so, because that is the moment people need information.
 *
 * The dismissal lives as a token rather than a boolean so two quick adds in a
 * row each get their full time on screen.
 */
export function Toaster() {
  const { toast, notice, dismissNotice, setOpen, count } = useCart()
  const [retired, setRetired] = useState<number | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setRetired(toast.token), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const record = toast && toast.token !== retired ? getRecord(toast.slug) : undefined
  const show = Boolean(record) || Boolean(notice)

  if (!show) return null

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {record && (
        <div className="animate-pop pointer-events-auto flex items-start gap-3 border border-paper/12 bg-sleeve px-4 py-3 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.9)]">
          <span className="mt-0.5 text-amber" aria-hidden="true">
            ✳
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-paper">
              <span className="text-paper-faint">In the bag —</span>{' '}
              <span className="truncate">{record.title}</span>
            </p>
            {count > 0 && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="cat mt-1.5 text-amber transition-colors hover:text-amber-bright"
              >
                {count} in bag · view
              </button>
            )}
          </div>
        </div>
      )}

      {notice && (
        <div
          className={cx(
            'animate-pop pointer-events-auto flex items-start gap-3 border border-amber/35 bg-sleeve px-4 py-3',
            'shadow-[0_18px_40px_-20px_rgb(0_0_0/0.9)]',
          )}
        >
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-paper-dim">{notice}</p>
          <button
            type="button"
            onClick={dismissNotice}
            className="runin shrink-0 pt-0.5 transition-colors hover:text-paper"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
