'use client'

import Link from 'next/link'

import { Disc } from './Disc'
import { getRecord } from '@/lib/catalog'
import { cx } from '@/lib/format'
import { usePlayer } from '@/lib/store/player'

/**
 * The dock.
 *
 * A record shop has a counter, and the counter has a record on it that is
 * half on and half off. When something is playing, a small turntable parks
 * itself at the bottom of the window: the disc turns, a runout of amber creeps
 * round, and a control strip falls away underneath for stop and volume.
 *
 * It only exists while something is on the platter. An empty dock is furniture
 * nobody asked for.
 */
export function PlayerDock() {
  const { state, playingSlug, toggle, setVolume } = usePlayer()

  if (state.status === 'idle' || !playingSlug) return null

  const record = getRecord(playingSlug)
  if (!record) return null

  const dropping = state.status === 'dropping'
  const ending = state.status === 'ending'
  const pct = Math.round(state.progress * 100)

  return (
    <div
      className="animate-drawer fixed inset-x-0 bottom-0 z-40 border-t border-paper/12 bg-sleeve/97 backdrop-blur-[2px]"
      role="region"
      aria-label="Now playing"
    >
      {/* Progress, as a hairline along the very top of the dock. */}
      <div className="h-px w-full bg-paper/10" aria-hidden="true">
        <div
          className="h-full bg-amber transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:gap-6 sm:px-8">
        {/* The half-played disc. */}
        <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14" aria-hidden="true">
          <div
            className={cx(
              'h-full w-full rounded-full motion-platter',
              ending ? 'opacity-50' : 'animate-[platter-idle_1.8s_linear_infinite]',
            )}
          >
            <Disc record={record} side="A" className="h-full w-full rounded-full" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[0.625rem] uppercase tracking-[0.2em] text-amber">
            {dropping ? 'Needle dropping' : ending ? 'Lifting' : 'Now playing'}
          </p>
          <p className="truncate text-sm text-paper">{record.title}</p>
          <p className="truncate text-xs text-paper-faint">
            {record.artist} · {record.rpm === 45 ? '45' : '33'} rpm
          </p>
        </div>

        {/* Seconds remaining, tabular so it does not jitter. */}
        <p className="hidden shrink-0 font-mono text-sm text-paper-dim sm:block" aria-hidden="true">
          {String(state.remaining).padStart(2, '0')}s
        </p>

        {/* Volume. Keyboard reachable, and it is a real range input. */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <label htmlFor="dock-volume" className="sr-only">
            Preview volume
          </label>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-paper-faint" aria-hidden="true" fill="currentColor">
            <path d="M7 2.5 3.8 5.4H1.5v5.2h2.3L7 13.5V2.5Z" />
            <path
              d="M9.6 5.4a3.4 3.4 0 0 1 0 5.2M11.6 3.4a6.2 6.2 0 0 1 0 9.2"
              stroke="currentColor"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="dock-volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(state.volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-paper/15 accent-[#e0a63c]"
          />
        </div>

        <button
          type="button"
          onClick={() => toggle(record.slug)}
          className="btn btn-ghost btn-sm shrink-0"
          aria-label={dropping ? 'Stop the preview' : `Stop playing ${record.title}`}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <rect x="2.5" y="2.5" width="7" height="7" />
          </svg>
          Stop
        </button>

        <Link href={`/records/${record.slug}`} className="hidden shrink-0 sm:block">
          <span className="sr-only">Go to {record.title}</span>
          <ArrowIcon />
        </Link>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-paper-faint transition-colors hover:text-amber" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
