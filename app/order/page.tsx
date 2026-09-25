import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { OrderLookup } from '@/components/OrderLookup'
import { SHOP } from '@/lib/catalog'
import { lookupOrder } from '@/lib/stripe/orders'

export const metadata: Metadata = {
  title: 'Your order',
  description:
    'Look up a Holloway Records order with the reference from your confirmation email. Postage, lines and totals, in one place.',
}

/**
 * Coming back from the till, the reference is in the address — so the lookup
 * happens here, while rendering, rather than in the browser afterwards.
 */
type Search = { searchParams: Promise<{ ref?: string }> }

export default async function OrderPage({ searchParams }: Search) {
  const { ref } = await searchParams
  const initialRef = (ref ?? '').trim().toUpperCase()
  const order = initialRef ? await lookupOrder(initialRef) : null

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="runin">The ledger</p>
        <h1 className="display-xl mt-5 text-[clamp(2.75rem,9vw,5rem)] text-paper">Your order</h1>
        <p className="mt-6 max-w-prose text-base leading-relaxed text-paper-dim">
          Every order we send has a reference like{' '}
          <span className="font-mono text-amber">HRW-4K7Q-92MX</span> in the confirmation email.
          Type it in and the whole thing comes back: what you bought, what you paid, and where it
          is. If it is not there, the counter is on 0117 496 0141 between {SHOP.hours[0].open} and{' '}
          {SHOP.hours[0].close}.
        </p>

        <div className="mt-14">
          <OrderLookup initialRef={initialRef} initialOrder={order} initialMissing={Boolean(initialRef) && !order} />
        </div>

        <div className="mt-20 border-t border-paper/10 pt-8">
          <h2 className="runin border-b border-paper/10 pb-3">While you wait</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-paper">Packed, but not posted yet</dt>
              <dd className="mt-1 text-paper-dim">
                Orders placed before 3pm on a working day go into the same parcel run, and the
                tracking number lands by email the moment Royal Mail scans it.
              </dd>
            </div>
            <div>
              <dt className="text-paper">Splitting an order</dt>
              <dd className="mt-1 text-paper-dim">
                If you buy a first pressing and a reissue, we will split them into two parcels
                rather than risk a record arriving bent. You pay postage once.
              </dd>
            </div>
            <div>
              <dt className="text-paper">Something arrived wrong</dt>
              <dd className="mt-1 text-paper-dim">
                Tell us within 14 days and we will cover the return postage. See the postage page
                for the rest of the small print.
              </dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer />
    </>
  )
}
