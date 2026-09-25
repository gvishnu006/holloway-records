# Holloway Records

A second-hand record shop that runs in one Next.js app.

Hover a sleeve and the record slides out of it. Click and the tonearm swings in,
the needle drops with a thunk, and fifteen seconds of music is written out live
in your browser. There is no audio file anywhere in this project, because the
whole thing is synthesised by a small step sequencer at `lib/audio/engine.ts`.

No Express. No separate API. The Stripe Checkout, the order lookup and the
webhook are three Route Handlers in the same deployment.

```bash
npm install
npm run dev          # http://localhost:3000
```

The shop browses, plays and checks out with **no configuration at all** — see
[Demo mode](#demo-mode).

---

## What is in here

```
app/
  layout.tsx                 fonts, metadata, providers, dock, drawer
  page.tsx                   the shop floor: hero, ticker, crate, footer
  records/[slug]/page.tsx    one record, twelve of them, pre-rendered
  about/page.tsx             grades, the rules, the colophon
  shipping/page.tsx          postage, packing, returns
  order/page.tsx             look up an order by reference
  api/checkout/route.ts      POST — creates a Stripe Checkout session
  api/orders/route.ts        GET  — look up an order
  api/webhooks/stripe/       POST — Stripe calls this when a payment lands
  sitemap.ts robots.ts opengraph-image.tsx

components/
  SleeveArt.tsx    twelve cover designs, drawn as SVG
  Disc.tsx         the pressing: grooves, label, runout, edge
  Tonearm.tsx      pivot, counterweight, headshell, needle
  SleeveReveal.tsx the interaction: hover to slide out, click to play
  useSpin.ts       the platter's speed, via the Web Animations API
  CrateBrowser.tsx search, sort, list/grid
  RecordRow.tsx    the crate listing
  RecordTile.tsx   the grid card
  RecordDetail.tsx the counter conversation
  HeroTurntable.tsx the first thing you see
  PlayerDock.tsx   the counter with a record half on
  CartDrawer.tsx   the receipt drawer
  Toaster.tsx      the counter bell
  Header.tsx Footer.tsx Marquee.tsx Providers.tsx OrderLookup.tsx

lib/
  catalog.ts       twelve records, every fact about them
  commerce.ts      postage rules (safe on both sides of the wire)
  format.ts        money, dates, catalogue numbers
  audio/           the sequencer, the voices, the noise
  store/           React contexts for the player and the bag
  stripe/          client, pricing, in-memory order ledger
```

## How the interaction works

**Hover.** The disc translates out from behind the sleeve and the platter picks
up 25 rpm. Speed is not a CSS keyframe — `useSpin` reads the element's current
angle out of its computed transform and starts the new animation from there, so
changing speed is genuinely seamless rather than a jump.

**Click.** The engine schedules about 300ms of silence while the arm swings in
(`needle-fall` in `app/globals.css`), then fires a low thunk — a 58 Hz sine with
a fast pitch drop — as the stylus lands. Only then does the music start, and
the platter ramps from 15% to full speed over 900ms.

**The music.** Each record carries a `preview` object: tempo, key, scale, chord
progression, drum pattern, synth voice, swing. The sequencer writes six bars,
then runs the whole mix through wow & flutter, a groove lowpass, a compressor,
and a bus of surface noise with randomly scheduled pops. The pops are
deterministic — seeded from the catalogue number — so a record always crackles
the same way.

**Background tabs.** Chrome throttles timers, which would make the sequencer
stutter, so the surface noise is suspended on `visibilitychange`.

## Demo mode

With no `STRIPE_SECRET_KEY` set, `POST /api/checkout` prices the basket against
the catalogue, mints a reference like `HRW-4K7Q-92MX`, stores it in memory and
redirects to `/order?ref=…`, which renders the receipt. No Stripe account, no
keys, no test cards.

Two honest caveats:

- Orders live in a `Map`, so they do not survive a server restart, and on
  serverless they do not survive a different instance. Real orders are
  reconciled against Stripe on lookup, which is durable.
- No audio is fetched, so there is no bandwidth cost and previews start
  instantly.

## Turning the till on

```bash
cp .env.example .env.local
```

| Variable | Needed for |
| --- | --- |
| `STRIPE_SECRET_KEY` | Enables the live till. `sk_test_…` works fine. |
| `STRIPE_WEBHOOK_SECRET` | Verifying `checkout.session.completed`. |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in metadata, sitemap, and the Stripe return. |
| `STOREFRONT_URL` | Fallback for the same, if you would rather not expose one. |

Forward the webhook locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Prices always come from `lib/catalog.ts` on the server. The client sends slugs
and quantities; it never gets to say what something costs.

## Scripts

| | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, flat config |

## Accessibility and motion

- Every spinning record has a button with a real label, and `aria-pressed`.
- Focus is a warm 2px amber outline, never removed.
- The bag is a proper modal: `aria-modal`, focus moved in, focus trapped, Escape
  closes.
- `prefers-reduced-motion` collapses every animation and transition in the
  project to nothing. The record still slides out of its sleeve and still plays
  — it just does not spin.
- Live regions announce the bag count, the result count, and the search result
  so a screen reader hears the change.

## Design notes

The rules the whole thing obeys:

1. **Matte, never glossy.** Surfaces are solid warm black with an SVG grain
   plate laid over them at 5.5% opacity. No glass, no blur beyond 2px, no
   gradient except one warm lamp above the counter.
2. **One accent.** Amber `#e0a63c` — the colour of a record label's paper
   centre. Condition grades get a quiet second signal (mint, deep amber, rust)
   and nothing else does.
3. **Editorial, not dashboard.** Fraunces for record names, Instrument Sans
   for anything read at length, IBM Plex Mono for anything that is data
   (catalogue numbers, runouts, prices, timings) so it cannot be mistaken for a
   claim.
4. **No filler.** Twelve records, and the notes say what is wrong with them —
   the water mark, the price sticker ghost, the silent scratch.

## Licence

MIT. It is a fictional shop, the records are fictional, and nobody is going to
knock on the door at 41 Holloway Street.
