import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { POSTAGE, FREE_POSTAGE_OVER } from '@/lib/commerce'
import { SHOP } from '@/lib/catalog'
import { money } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Postage and returns',
  description:
    'How Holloway Records posts a record so it arrives flat, what postage costs, and what to do if something turns up damaged.',
}

/** A record is 300mm across and about 3mm thick. These numbers are real. */
const PARCELS = [
  {
    name: 'One record',
    note: 'Sleeve out of the jacket, both in one poly bag.',
    postage: POSTAGE,
    eta: '2–3 working days',
  },
  {
    name: 'Two or more',
    note: 'Still one parcel, still £3.50.',
    postage: POSTAGE,
    eta: '2–3 working days',
  },
  {
    name: `Over ${money(FREE_POSTAGE_OVER)}`,
    note: 'Postage is on us. Nothing changes about the packing.',
    postage: 0,
    eta: '2–3 working days',
  },
] as const

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="runin">Getting it to you</p>
        <h1 className="display-xl mt-6 max-w-4xl text-[clamp(3rem,10vw,6.5rem)] text-paper">
          Postage,
          <br />
          <span className="text-amber">returns</span> and
          <br />
          how we pack.
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-paper-dim">
          {SHOP.shippingNote} We post Tuesday to Friday, because Monday is grading day and Friday
          afternoon is when Royal Mail stops collecting from us.
        </p>

        <section className="mt-16">
          <h2 className="runin border-b border-paper/10 pb-3">What it costs</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {PARCELS.map((p) => (
              <li key={p.name} className="grain border border-paper/10 bg-sleeve p-6">
                <h3 className="display-md text-xl text-paper">{p.name}</h3>
                <p className="display-lg mt-4 text-3xl text-amber">
                  {p.postage === 0 ? 'Free' : money(p.postage)}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-paper-dim">{p.note}</p>
                <p className="runin mt-4">{p.eta}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-prose text-sm leading-relaxed text-paper-faint">
            If a first pressing and its reissue are both in your bag, we will split them into two
            parcels rather than risk a corner going through. You still pay postage once.
          </p>
        </section>

        <section className="mt-20 grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="display-md text-2xl text-paper">How a record is packed</h2>
            <ol className="mt-6 space-y-5">
              {[
                'Sleeve out of the jacket. Two cardboard boards, one either side, taped along the middle only — never the edges, so nothing sticks to the sleeve.',
                'The record in its inner, outside both boards, so the jacket is not pressed against the vinyl.',
                'Corner protection, then a padded envelope. A 12" record needs 305mm of width and it is not negotiable.',
                'Both in one box, addressed in caps, with the reference written on the outside as well as inside.',
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="cat shrink-0 pt-0.5 text-amber">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-relaxed text-paper-dim">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="display-md text-2xl text-paper">If something is wrong</h2>
            <div className="mt-6 space-y-6 text-sm leading-relaxed text-paper-dim">
              <p>
                <span className="text-paper">Snapped in transit.</span> Send us a photo of the
                packaging within 14 days. We will replace the record or refund it in full, and we
                do not ask you to send the broken one back.
              </p>
              <p>
                <span className="text-paper">Mislabelled by us.</span> If the record that turns up
                is not the one you bought, that is ours entirely. Postage both ways is on us, and
                we will find the correct one if we still have it.
              </p>
              <p>
                <span className="text-paper">Graded wrong.</span> This is the only one we argue
                about, and we will argue in good faith. If a record plays materially worse than the
                description on this site, we will take it back for a full refund including the
                postage you paid.
              </p>
              <p>
                <span className="text-paper">Changed your mind.</span> A sealed, unplayed record
                can go back within 14 days for a full refund. A played one cannot, because we
                cannot sell it again — but we will happily buy it off you at the price we paid.
              </p>
            </div>
            <p className="mt-8 text-sm text-paper-faint">
              Ring the counter on{' '}
              <a href={`tel:${SHOP.phone.replace(/\s/g, '')}`} className="text-amber hover:text-amber-bright">
                {SHOP.phone}
              </a>{' '}
              rather than emailing — it is faster and the person who graded your record picks up.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
