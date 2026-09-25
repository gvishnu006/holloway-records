'use client'

import { useEffect, useRef, useState } from 'react'

import { Disc } from './Disc'
import { SleeveArt } from './SleeveArt'
import { Tonearm } from './Tonearm'
import type { RecordItem } from '@/lib/catalog'
import { RPM_33, RPM_45, RPM_COAST, useSpin } from '@/lib/audio/useSpin'
import { cx } from '@/lib/format'
import { usePlayer } from '@/lib/store/player'

/**
 * A record in its sleeve, and the reason you are here.
 *
 * Hover (or focus) and the record slides halfway out of the jacket — which is
 * what you actually do in a shop when you want to see the label — and coasts
 * round. Click and the tonearm swings in, the needle drops with a thunk, and
 * the platter spins up to its true speed.
 *
 * The disc is deliberately allowed to overhang its container. In the list view
 * it settles over the track listing, which is the whole point: you are looking
 * at the record, not at a thumbnail of one.
 */

type Variant = 'row' | 'tile' | 'hero'

const TRAVEL: Record<Variant, string> = {
  row: 'translate-x-[92%]',
  tile: 'translate-x-[74%] sm:translate-x-[88%]',
  hero: 'translate-x-[88%]',
}

const SLEEVE_SHIFT: Record<Variant, string> = {
  row: '-translate-x-[7%] -rotate-[1.6deg]',
  tile: '-translate-x-[4%] -rotate-[1.2deg] sm:-translate-x-[7%] sm:-rotate-[1.6deg]',
  hero: '-translate-x-[7%] -rotate-[1.6deg]',
}

type Props = {
  record: RecordItem
  variant?: Variant
  side?: 'A' | 'B'
  className?: string
  /** Turn the whole thing into a button. Off for the detail page. */
  interactive?: boolean
  /**
   * 'hidden' — no arm at all (the list and bins).
   * 'parked' — arm resting off the record (the detail page).
   * 'auto'   — the arm drops once on mount, silently, as a demonstration.
   */
  arm?: 'hidden' | 'parked' | 'auto'
  /** Keep the record permanently out of its sleeve (the hero turntable). */
  alwaysOut?: boolean
}

export function SleeveReveal({
  record,
  variant = 'tile',
  side = 'A',
  className,
  interactive = true,
  arm = 'hidden',
  alwaysOut = false,
}: Props) {
  const { isPlaying, toggle, state } = usePlayer()
  const [hovered, setHovered] = useState(false)
  const [showcased, setShowcased] = useState(false)
  const spinRef = useRef<HTMLDivElement>(null)

  const playing = isPlaying(record.slug)
  const progress = playing ? state.progress : 0

  // Coast on hover, true speed when the needle is down.
  const coasting = hovered || playing
  const rpm = playing ? (record.rpm === 45 ? RPM_45 : RPM_33) : RPM_COAST
  useSpin(spinRef, coasting, rpm, playing ? 900 : 0)

  const revealed = hovered || playing || alwaysOut

  // The demonstration needle drop. Fires once, a beat after the page settles.
  useEffect(() => {
    if (arm !== 'auto') return
    const t = window.setTimeout(() => {
      setShowcased(true)
      window.setTimeout(() => setShowcased(false), 1100)
    }, 1400)
    return () => window.clearTimeout(t)
  }, [arm])

  const armState: 'idle' | 'dropping' | 'locked' =
    playing && state.needleDropping ? 'dropping' : playing || showcased ? 'locked' : 'idle'
  const showArm = arm !== 'hidden' || playing || showcased

  return (
    <div
      className={cx('group/sleeve relative aspect-square w-full', className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* ── The record, behind the sleeve ─────────────────────────────── */}
      <div
        className={cx(
          'absolute inset-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          revealed ? TRAVEL[variant] : 'translate-x-0',
          playing ? 'z-20' : 'z-10',
        )}
      >
        <div
          ref={spinRef}
          className="relative aspect-square w-full rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #0c0b0a 0%, #060505 100%)',
            boxShadow: revealed
              ? '0 18px 40px -12px rgb(0 0 0 / 0.9), 0 2px 0 rgb(255 255 255 / 0.04) inset'
              : 'none',
            transition: 'box-shadow 500ms ease',
          }}
        >
          <Disc record={record} side={side} className="h-full w-full rounded-full" />

          {/* Edge thickness — you are looking at a disc, not a circle. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 210deg, #1a1714 0deg, #38332c 42deg, #12100e 96deg, #2c2721 168deg, #0d0c0b 240deg, #241f1a 312deg, #1a1714 360deg)',
              WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 0 49%, black 49.4%)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 0 49%, black 49.4%)',
              opacity: 0.85,
            }}
          />

          {/* Tonearm, only when it is doing something. */}
          {showArm && (
            <>
              <div className="absolute inset-0">
                <Tonearm state={armState} />
              </div>
              {/* Dust off the stylus. */}
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="pointer-events-none absolute rounded-full bg-paper/70"
                  style={{
                    left: `${66 + i * 3}%`,
                    top: `${52 + i * 2}%`,
                    width: 1.5,
                    height: 1.5,
                    animation: `dust-rise ${2600 + i * 700}ms ease-out ${i * 900}ms infinite`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── The sleeve, in front ───────────────────────────────────────── */}
      {interactive ? (
        <button
          type="button"
          onClick={() => toggle(record.slug)}
          aria-pressed={playing}
          className={cx(
            'sleeve-surface absolute inset-0 z-30 origin-bottom-left overflow-hidden text-left',
            'transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            revealed ? SLEEVE_SHIFT[variant] : 'translate-x-0',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber',
          )}
        >
          <SleeveArt cover={record.cover} title={record.title} />
          <span className="sr-only">
            {playing
              ? `Stop the preview of ${record.title} by ${record.artist}`
              : `Play a preview of ${record.title} by ${record.artist}`}
          </span>
        </button>
      ) : (
        <div
          className={cx(
            'sleeve-surface absolute inset-0 z-30 origin-bottom-left overflow-hidden',
            'transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            revealed ? SLEEVE_SHIFT[variant] : 'translate-x-0',
          )}
        >
          <SleeveArt cover={record.cover} title={record.title} />
        </div>
      )}

      {/* Shadow cast by the sleeve onto whatever is behind it. */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500"
        style={{
          opacity: revealed ? 1 : 0,
          boxShadow: '-14px 10px 30px -8px rgb(0 0 0 / 0.75)',
          filter: 'blur(6px)',
        }}
      />

      {/* Preview progress, pencilled along the bottom edge of the sleeve. */}
      {playing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-px bg-paper/10">
          <div
            className="h-full bg-amber transition-[width] duration-200 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
