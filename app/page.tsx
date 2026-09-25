import { CrateBrowser } from '@/components/CrateBrowser'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HeroTurntable } from '@/components/HeroTurntable'
import { Marquee } from '@/components/Marquee'
import { RECORDS, SHOP, getNewest } from '@/lib/catalog'
import { addedDate, money } from '@/lib/format'

/**
 * The shop floor.
 *
 * One hero, one crate, and a strip of paper between them. Everything else is
 * a link off this page — a record, the postage, the story, the order lookup.
 */

const STRIP = [
  ...RECORDS.map((r) => `${r.artist} — ${r.title}`),
  'Graded by ear',
  'Posted Tuesday to Friday',
  'Free postage over £75',
]

export default function HomePage() {
  const newest = getNewest()

  return (
    <>
      <Header />
      <main id="main">
        <HeroTurntable />

        <div className="mt-20">
          <Marquee items={STRIP} />
        </div>

        {newest && (
          <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
            <div className="grid gap-8 border-b border-paper/10 pb-10 md:grid-cols-[auto_1fr_auto] md:items-end">
              <div>
                <p className="runin">Just in</p>
                <p className="display-lg mt-3 text-3xl text-paper sm:text-4xl">
                  {newest.artist}
                  <span className="block text-amber">{newest.title}</span>
                </p>
              </div>
              <p className="max-w-prose text-sm leading-relaxed text-paper-dim">
                In the sleeve drawer since {addedDate(newest.added)},{' '}
                {newest.pressing.toLowerCase()}. {newest.houseNote}
              </p>
              <p className="display-md text-3xl text-paper md:text-right">
                {money(newest.price)}
              </p>
            </div>
          </section>
        )}

        <div id="crate" className="scroll-mt-24 pb-24">
          <CrateBrowser />
        </div>

        {/* The shop, briefly, before the footer says it again in full. */}
        <section className="border-y border-paper/10 bg-shelf">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
            <div>
              <h2 className="display-md text-2xl text-paper">We play it first</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                Every record in the drawer goes on the deck and gets listened to, all the way
                through, with the lights off. That is where the grade comes from — not from a
                cover, and not from a database someone else wrote.
              </p>
            </div>
            <div>
              <h2 className="display-md text-2xl text-paper">We tell you the price</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                What we paid is on every listing. If we got a record for £6 and it is going out at
                £18, you can see both numbers, and judge the risk yourself.
              </p>
            </div>
            <div>
              <h2 className="display-md text-2xl text-paper">One copy, mostly</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                {SHOP.shippingNote} If a record is on this site and in your bag, it is yours. We
                take payment first and pack it second.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
