'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

import { SHOP } from '@/lib/catalog'
import { cx, isOpenNow } from '@/lib/format'
import { useCart } from '@/lib/store/cart'

const NAV = [
  { href: '/', label: 'This month' },
  { href: '/order', label: 'Your order' },
  { href: '/shipping', label: 'Postage' },
  { href: '/about', label: 'The shop' },
]

/* ── Open or closed ────────────────────────────────────────────────────────
   Whether the shop is open depends on the clock, which the server does not
   share with the browser. Rather than guess at render time and then patch it,
   this is read as external state: null on the server, the real answer in the
   browser, and re-read every minute so it changes while the tab is open. */

const CLOCK = 60_000

function subscribeToClock(onChange: () => void) {
  const id = window.setInterval(onChange, CLOCK)
  return () => window.clearInterval(id)
}

const serverClock = () => null
const browserClock = () => isOpenNow(SHOP.hours)

export function Header() {
  const { count, toggle } = useCart()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-paper/8 bg-void/92 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-baseline gap-2.5">
          <span className="display-md text-[1.35rem] leading-none text-paper transition-colors group-hover:text-amber">
            Holloway
          </span>
          <span className="runin translate-y-[-1px] transition-colors group-hover:text-amber/70">Records</span>
        </Link>

        <span className="hidden h-6 w-px bg-paper/10 sm:block" aria-hidden="true" />

        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-6 sm:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'cat relative py-1 transition-colors',
                  active ? 'text-amber' : 'text-paper-faint hover:text-paper',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-0.5 left-0 h-px w-full bg-amber" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <OpenPill />

          <button
            type="button"
            onClick={toggle}
            className="btn btn-ghost btn-sm relative"
            aria-label={count > 0 ? `Your bag, ${count} items` : 'Your bag is empty'}
          >
            <BagIcon />
            <span className="hidden sm:inline">Bag</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-amber px-1 font-mono text-[0.5625rem] leading-none text-void">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Small screens: a single row of the nav underneath, no hamburger. */}
      <nav
        aria-label="Main, compact"
        className="flex gap-5 overflow-x-auto border-t border-paper/8 px-5 py-2.5 sm:hidden"
      >
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="cat shrink-0 text-paper-faint">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

function OpenPill() {
  const open = useSyncExternalStore(subscribeToClock, browserClock, serverClock)

  if (open === null) {
    return <span className="hidden h-6 w-24 md:block" aria-hidden="true" />
  }

  return (
    <span
      className="hidden items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] md:inline-flex"
      title={SHOP.shippingNote}
    >
      <span
        className={cx('h-1.5 w-1.5 rounded-full', open ? 'bg-mint' : 'bg-paper-ghost')}
        aria-hidden="true"
      />
      <span className={open ? 'text-paper-dim' : 'text-paper-faint'}>
        {open ? 'Open now' : 'Closed'}
      </span>
      <span className="sr-only">
        {open ? 'The shop is open now.' : 'The shop is closed. Opening hours are on the about page.'}
      </span>
    </span>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none">
      <path
        d="M2.5 5.5h11l-.9 9.2H3.4L2.5 5.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
