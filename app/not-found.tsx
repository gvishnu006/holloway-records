import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <p className="runin">404 · not in the drawer</p>
        <h1 className="display-xl mt-6 text-[clamp(3rem,10vw,6.5rem)] text-paper">
          That one
          <br />
          <span className="text-amber">sold.</span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-paper-dim">
          There is no page here. Either it was never on the site, or it was on the site and
          somebody beat you to it, which happens more than you would think with one-copy records.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-amber">
            Back to the crate
          </Link>
          <Link href="/order" className="btn btn-ghost">
            Look up an order
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
