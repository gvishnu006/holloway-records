'use client'

import Link from 'next/link'

import { SleeveReveal } from './SleeveReveal'
import { RecordTile } from './RecordTile'
import { GRADE_NOTE, getRelated, type RecordItem } from '@/lib/catalog'
import { addedDate, bareCatalog, cx, money } from '@/lib/format'
import { useCart } from '@/lib/store/cart'
import { usePlayer } from '@/lib/store/player'

/**
 * The counter conversation.
 *
 * Everything a buyer asks at the counter is on this page, in the order they
 * ask it: what is it, what pressing, what does it sound like, how is it
 * graded, what did you pay, and will you post it. The house note is the part
 * that actually sells it, so it gets the most room.
 */
export function RecordDetail({ record }: { record: RecordItem }) {
  const { add, lines, pulse } = useCart()
  const { isPlaying, toggle, state } = usePlayer()
  const playing = isPlaying(record.slug)
  const inBag = lines.find((l) => l.slug === record.slug)
  const justAdded = pulse === record.slug
  const related = getRelated(record, 3)

  const sides = (['A', 'B'] as const).map((side) => ({
    side,
    tracks: record.tracks.filter((t) => t.side === side),
  }))

  return (
    <article className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="runin">
        <Link href="/" className="transition-colors hover:text-amber">
          The crate
        </Link>
        <span className="mx-2 text-paper-ghost" aria-hidden="true">
          /
        </span>
        <span className="text-paper-dim">{bareCatalog(record.catalogNumber)}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        {/* ── Left: the record, out of its sleeve ───────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="grain mx-auto w-full max-w-[520px]">
            <SleeveReveal
              record={record}
              variant="hero"
              side={playing ? 'A' : 'A'}
              arm="parked"
              alwaysOut={playing}
            />
          </div>

          <p className="runin mx-auto mt-6 max-w-[520px] text-center">
            Hover the sleeve to slide the record out · click to drop the needle
          </p>
        </div>

        {/* ── Right: everything the buyer wants ──────────────────────────── */}
        <div className="min-w-0">
          <p className="runin">{record.genre}</p>
          <h1 className="display-xl mt-4 text-[clamp(2.75rem,7vw,5rem)] text-paper">{record.title}</h1>
          <p className="mt-4 text-xl text-paper-dim">{record.artist}</p>

          {/* The till. */}
          <div className="mt-9 flex flex-wrap items-center gap-4 border-y border-paper/10 py-6">
            <div>
              <p className="display-lg text-4xl text-paper">{money(record.price)}</p>
              {record.paid !== null && (
                <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-ghost">
                  We paid {money(record.paid)} · posted from Bristol
                </p>
              )}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => add(record.slug)}
                className={cx('btn', justAdded ? 'btn-amber' : 'btn-ghost')}
              >
                {justAdded ? 'In the bag' : record.stock === 1 ? 'Take it' : 'Add to bag'}
              </button>
              {inBag && (
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-faint">
                  {inBag.qty} in bag
                </span>
              )}
            </div>
          </div>

          {/* House note, in full. */}
          <div className="mt-10">
            <h2 className="runin border-b border-paper/10 pb-3">Off the counter</h2>
            <p className="mt-5 text-lg leading-relaxed text-paper">{record.houseNote}</p>
            <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-amber/80">
              Sounds like: {record.soundsLike}
            </p>
          </div>

          {/* Pressing details. */}
          <div className="mt-12">
            <h2 className="runin border-b border-paper/10 pb-3">The pressing</h2>
            <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              <Fact label="Label">
                {record.label} · {record.year}
              </Fact>
              <Fact label="Catalogue">
                <span className="text-amber/80">{record.catalogNumber}</span>
              </Fact>
              <Fact label="Pressing">{record.pressing}</Fact>
              <Fact label="Speed">
                {record.rpm === 45 ? '45 rpm single' : '33⅓ rpm'} · {record.stock}{' '}
                {record.stock === 1 ? 'copy' : 'copies'} in stock
              </Fact>
              <Fact label="Runout">
                <span className="text-[0.8125rem] leading-relaxed">{record.runout}</span>
              </Fact>
              <Fact label="In the shop since">{addedDate(record.added)}</Fact>
            </dl>
          </div>

          {/* Grades, explained rather than asserted. */}
          <div className="mt-12">
            <h2 className="runin border-b border-paper/10 pb-3">Condition, in plain words</h2>
            <ul className="mt-5 space-y-4">
              {(['vinyl', 'sleeve'] as const).map((part) => (
                <li key={part} className="flex gap-4">
                  <span
                    className={cx(
                      'stamp shrink-0 self-start',
                      part === 'vinyl' ? 'text-amber' : 'text-paper-dim',
                    )}
                  >
                    {record.condition[part]}
                  </span>
                  <p className="text-sm leading-relaxed text-paper-dim">
                    <span className="capitalize text-paper">{part}:</span>{' '}
                    {GRADE_NOTE[record.condition[part]]}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Tracklist. */}
          <div className="mt-12">
            <h2 className="runin border-b border-paper/10 pb-3">Tracks</h2>
            {sides.map(({ side, tracks }) =>
              tracks.length === 0 ? null : (
                <div key={side} className="mt-5">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-amber/70">
                    Side {side}
                  </p>
                  <ul className="mt-2">
                    {tracks.map((t) => (
                      <li key={t.n} className="flex items-baseline gap-3 py-1.5">
                        <span className="cat w-7 shrink-0 text-paper-ghost">{t.n}</span>
                        <span className="text-sm text-paper-dim">{t.title}</span>
                        <span className="leader" aria-hidden="true" />
                        <span className="cat shrink-0 text-paper-faint">{t.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>

          {/* Playing from here. */}
          <div className="mt-12 flex flex-wrap items-center gap-4 border border-paper/10 p-5">
            <div>
              <p className="text-sm text-paper-dim">
                A fifteen-second preview, written out live in your browser. No audio file is
                downloaded, because there is no audio file.
              </p>
              {playing && (
                <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-ghost">
                  {state.status === 'dropping' ? 'Dropping the needle…' : `${state.remaining}s left`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggle(record.slug)}
              aria-pressed={playing}
              className={cx('btn ml-auto', playing ? 'btn-ghost' : 'btn-amber')}
            >
              {playing ? 'Stop' : 'Play preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Related. */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-24">
          <div className="flex items-baseline gap-4 border-b border-paper/10 pb-4">
            <h2 id="related-heading" className="display-md text-2xl text-paper">
              Near this one
            </h2>
            <span className="leader" aria-hidden="true" />
            <span className="runin">Same shelf, other crates</span>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <RecordTile record={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="runin">{label}</dt>
      <dd className="mt-1.5 text-sm text-paper-dim">{children}</dd>
    </div>
  )
}
