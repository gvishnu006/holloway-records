import type { Metadata, Viewport } from 'next'
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'

import { CartDrawer } from '@/components/CartDrawer'
import { PlayerDock } from '@/components/PlayerDock'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/Toaster'

import './globals.css'

/* Fraunces carries the shop's voice — a wonky old-style serif with a soft
   optical axis, so the big record names feel hand-painted on a shop sign.
   It is loaded as a variable font: no weight array, so SOFT/WONK/opsz are
   allowed, and every weight comes along with it. */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
})

/* Everything you actually read at length: newsprint-adjacent, slightly narrow
   apertures, no Inter. */
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

/* Catalogue numbers, matrix runouts, prices, timings. Anything that is data
   rather than prose gets mono, so it can't be mistaken for a claim. */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-plex-mono',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Holloway Records — second-hand vinyl, 41 Holloway Street',
    template: '%s — Holloway Records',
  },
  description:
    'A second-hand record shop on the web. Twelve records dug out of the back room, graded by ear, shipped Tuesday to Friday. Hover to spin, click for a needle-drop preview.',
  keywords: ['vinyl records', 'second-hand records', 'record shop', 'crate digging', 'turntable'],
  openGraph: {
    type: 'website',
    siteName: 'Holloway Records',
    locale: 'en_GB',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#080706',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-amber focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-void"
        >
          Skip to the records
        </a>
        <Providers>
          {children}
          <PlayerDock />
          <CartDrawer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
