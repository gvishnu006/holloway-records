'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { Disc } from './Disc'
import { SleeveArt } from './SleeveArt'
import { Tonearm } from './Tonearm'
import { getRecord } from '@/lib/catalog'
import { RPM_45, useSpin } from '@/lib/audio/useSpin'
import { money } from '@/lib/format'
import { usePlayer } from '@/lib/store/player'

/**
 * The first thing you see: one record on a turntable, out of its sleeve.
 *
 * It idles at a slow, wrong 33⅓ so the platters in the shop do not quite
 * agree with each other, and it is deliberately the one record you cannot
 * play from here — the shop's own pressing — so the click goes to the detail
 * page. Everything else on the page is a link to a record that does play.
 */
const HERO_SLUG = 'ptarmigan-lift-music'

export function HeroTurntable() {
  const record = getRecord(HERO_SLUG)
  const spinRef = useRef<HTMLDivElement>(null)
  const { state, toggle } = usePlayer()

  // Hooks first: the platter turns whether or not the lookup came back.
  useSpin(spinRef, true, RPM_45, 0)

  if (!record) return null

  const playing = state.status !== 'idle' && state.slug === record.slug

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-8 pt-10 sm:px-8 sm:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
        <div className="max-w-xl">
          <p className="runin animate-draw inline-block">A record shop, one shelf at a time</p>
          <h1 className="display-xl mt-6 text-[clamp(3.4rem,10vw,6.5rem)] text-paper">
            Everything
            <br />
            played
            <br />
            <span className="text-amber">once</span> before
            <br />
            it is priced.
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-paper-dim">
            {record.houseNote.split('. ')[0]}. Twelve records dug out of the back room this month,
            each one graded by putting it on the deck and listening to the whole side.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="#crate" className="btn btn-amber">
              Go to the crate
            </Link>
            <button
              type="button"
              onClick={() => toggle(record.slug)}
              className="btn btn-ghost"
              aria-pressed={playing}
            >
              {playing ? (
                <>
                  <StopIcon /> Lift the needle
                </>
              ) : (
                <>
                  <PlayIcon /> Hear side A
                </>
              )}
            </button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-paper/10 pt-8">
            <div>
              <dt className="runin">Records</dt>
              <dd className="display-md mt-1.5 text-2xl text-paper">12</dd>
            </div>
            <div>
              <dt className="runin">From</dt>
              <dd className="display-md mt-1.5 text-2xl text-paper">{money(1800)}</dd>
            </div>
            <div>
              <dt className="runin">Posted</dt>
              <dd className="display-md mt-1.5 text-2xl text-paper">48h</dd>
            </div>
          </dl>
        </div>

        {/* The turntable itself. */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="relative aspect-square">
            {/* Platter. */}
            <div className="absolute inset-0 rounded-full bg-shelf shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]">
              <div
                ref={spinRef}
                className="absolute inset-[7%] rounded-full will-change-transform"
                style={{ background: 'radial-gradient(circle at 50% 50%, #0c0b0a 0%, #060505 100%)' }}
              >
                <Disc record={record} side="A" className="h-full w-full rounded-full" />
              </div>

              {/* Mat. */}
              <div
                className="absolute inset-[2.5%] rounded-full border border-paper/8"
                aria-hidden="true"
              />
            </div>

            {/* Tonearm, drawn over the platter. */}
            <Tonearm state={playing && state.needleDropping ? 'dropping' : playing ? 'locked' : 'idle'} />

            {/* Dust off the stylus, always. */}
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="pointer-events-none absolute rounded-full bg-paper/60"
                style={{
                  left: `${64 + i * 2.5}%`,
                  top: `${50 + i * 2}%`,
                  width: 1.6,
                  height: 1.6,
                  animation: `dust-rise ${2800 + i * 800}ms ease-out ${i * 1100}ms infinite`,
                }}
              />
            ))}

            {/* The empty sleeve it came out of. */}
            <div className="absolute -right-4 -top-4 w-28 rotate-[-7deg] opacity-40 sm:-right-6 sm:-top-6 sm:w-36">
              <div className="sleeve-surface edge-lit aspect-square overflow-hidden">
                <SleeveArt cover={record.cover} title={record.title} />
              </div>
              <p className="runin mt-2 text-right">sleeve, empty</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M2.5 1.4v9.2L10 6 2.5 1.4Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="7" height="7" />
    </svg>
  )
}
