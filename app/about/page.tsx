import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { RecordTile } from '@/components/RecordTile'
import { GRADES, GRADE_NOTE, RECORDS, SHOP } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'The shop',
  description:
    'Holloway Records, second-hand vinyl on Holloway Street. How we grade a record, why we publish what we paid, and who is behind the counter.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="runin">{SHOP.street} · since {SHOP.est}</p>
          <h1 className="display-xl mt-6 max-w-4xl text-[clamp(3rem,10vw,7rem)] text-paper">
            A shop that tells you
            <br />
            <span className="text-amber">what it paid.</span>
          </h1>
          <p className="mt-9 max-w-2xl text-lg leading-relaxed text-paper-dim">
            We buy records out of house clearances, car-boot sales and people&rsquo;s attics, in
            and around Bristol. Most of what we sell has been played — by us, in the shop, on the
            deck in the corner, with the lights off. Then it gets a grade, a note, and a price
            sticker.
          </p>
        </section>

        {/* How grading works. The part nobody else explains. */}
        <section className="border-y border-paper/10 bg-shelf">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="display-lg text-3xl text-paper sm:text-4xl">
              What the grades mean
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-paper-dim">
              These are the usual Goldmine letters, minus the ones that are not honest. Nothing we
              sell is unplayed, so there is no &ldquo;still sealed&rdquo; here.
            </p>

            <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {GRADES.map((g) => (
                <div key={g} className="border-t border-paper/10 pt-5">
                  <dt className="display-md text-2xl text-amber">{g}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-paper-dim">
                    {GRADE_NOTE[g]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* The three rules we actually run the shop on. */}
        <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <p className="runin">One</p>
              <h2 className="display-md mt-3 text-2xl text-paper">Play it all the way through</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                Not a sample, not the first two minutes. The click on side B of a record only shows
                up at 4:12, and that is exactly the click the buyer needs to know about.
              </p>
            </div>
            <div>
              <p className="runin">Two</p>
              <h2 className="display-md mt-3 text-2xl text-paper">Write the note yourself</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                Every listing has a paragraph from whoever pulled it out of the crate, including
                the things that would put you off: the water mark, the price sticker ghost, the
                scratch that is silent until the runout.
              </p>
            </div>
            <div>
              <p className="runin">Three</p>
              <h2 className="display-md mt-3 text-2xl text-paper">Publish the margin</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                What we paid is printed next to what we are asking. If a record is a lot of money,
                you should be able to see how much of that is us being greedy.
              </p>
            </div>
          </div>
        </section>

        {/* A sample of what the drawer looks like. */}
        <section className="border-t border-paper/10">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
            <div className="flex items-baseline gap-4 border-b border-paper/10 pb-4">
              <h2 className="display-md text-2xl text-paper">On the shelf right now</h2>
              <span className="leader" aria-hidden="true" />
              <span className="runin">Hover to spin, click to play</span>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {[
                'blue-meridian-quintet-oblique',
                'astral-broadcast-nightwatch',
                'draymoor-set-concrete-sunday',
                'ferrier-barbed-wire',
              ].map((slug) => {
                const record = RECORDS.find((r) => r.slug === slug)
                return record ? (
                  <li key={slug}>
                    <RecordTile record={record} />
                  </li>
                ) : null
              })}
            </ul>
          </div>
        </section>

        {/* The colophon, properly. */}
        <section className="border-t border-paper/10 bg-shelf">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-2">
            <div>
              <h2 className="display-md text-2xl text-paper">Opening hours</h2>
              <table className="mt-6 w-full text-left font-mono text-xs uppercase tracking-[0.14em]">
                <tbody>
                  {SHOP.hours.map((h) => (
                    <tr key={h.day} className="border-b border-paper/8 last:border-0">
                      <th scope="row" className="py-2.5 font-normal text-paper-faint">
                        {h.day}
                      </th>
                      <td className="py-2.5 text-right text-paper-dim">
                        {h.open}–{h.close}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-2.5 font-normal text-paper-ghost">
                      Monday
                    </th>
                    <td className="py-2.5 text-right text-paper-ghost">
                      Closed — grading day
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="display-md text-2xl text-paper">Getting here</h2>
              <address className="mt-6 space-y-1.5 text-sm not-italic text-paper-dim">
                <p>{SHOP.street}</p>
                <p>{SHOP.city}</p>
                <p className="pt-3">
                  <a href={`tel:${SHOP.phone.replace(/\s/g, '')}`} className="hover:text-amber">
                    {SHOP.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${SHOP.email}`} className="hover:text-amber">
                    {SHOP.email}
                  </a>
                </p>
              </address>
              <p className="mt-6 text-sm leading-relaxed text-paper-faint">
                There is a listening bench by the window and a deck you are welcome to use. Bring
                a record, put it on, decide for yourself — that is the whole point of the place.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
