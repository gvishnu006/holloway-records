import Link from 'next/link'

import { SHOP } from '@/lib/catalog'

/**
 * The colophon.
 *
 * Everything a customer would want to know before trusting a small shop with
 * money: who we are, where we are, what we pay, and where the postage goes.
 */

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-32 border-t border-paper/10 bg-shelf">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="display-lg text-4xl text-paper">
              Holloway <span className="text-amber">Records</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-dim">
              {SHOP.tagline}. Everything is graded by playing it, priced by what we paid, and posted
              from the shop door. No algorithmic recommendations, no stock that does not exist.
            </p>
            <p className="mt-6 runin">
              Est. {SHOP.est} · {SHOP.city}
            </p>
          </div>

          <div>
            <h2 className="runin border-b border-paper/10 pb-3">Find us</h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-paper-dim">
              <p>{SHOP.street}</p>
              <p>{SHOP.city}</p>
              <p className="pt-3">
                <a href={`tel:${SHOP.phone.replace(/\s/g, '')}`} className="leader-link hover:text-amber">
                  {SHOP.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${SHOP.email}`} className="hover:text-amber">
                  {SHOP.email}
                </a>
              </p>
            </address>

            <table className="mt-6 w-full text-left font-mono text-[0.6875rem] uppercase tracking-[0.14em]">
              <caption className="sr-only">Opening hours</caption>
              <tbody>
                {SHOP.hours.map((h) => (
                  <tr key={h.day} className="border-b border-paper/6 last:border-0">
                    <th scope="row" className="py-1.5 font-normal text-paper-faint">
                      {h.day}
                    </th>
                    <td className="py-1.5 text-right text-paper-dim">
                      {h.open}–{h.close}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-1.5 font-normal text-paper-ghost">
                    Mon
                  </th>
                  <td className="py-1.5 text-right text-paper-ghost">Closed — grading day</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="runin border-b border-paper/10 pb-3">Elsewhere</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-paper-dim transition-colors hover:text-amber">
                  This month&rsquo;s twelve
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-paper-dim transition-colors hover:text-amber">
                  How we grade, and why we say what we paid
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-paper-dim transition-colors hover:text-amber">
                  Postage, returns, and how we pack a record
                </Link>
              </li>
              <li>
                <Link href="/order" className="text-paper-dim transition-colors hover:text-amber">
                  Look up an order you have placed
                </Link>
              </li>
            </ul>

            <p className="mt-8 text-sm leading-relaxed text-paper-faint">
              {SHOP.shippingNote}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-paper-ghost">
            &copy; {year} Holloway Records — a fictional shop, built as a demonstration
          </p>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-paper-ghost">
            Records played, not scanned
          </p>
        </div>
      </div>
    </footer>
  )
}
