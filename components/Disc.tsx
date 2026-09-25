import { memo } from 'react'

import type { RecordItem } from '@/lib/catalog'
import { bareCatalog } from '@/lib/format'

/**
 * A 12" pressing, drawn.
 *
 * The rotationally-symmetric part of a record is invisible when it turns, so
 * the things that sell the motion are the asymmetric ones: the label artwork,
 * the runout etch. The specular streak deliberately does NOT rotate — that
 * highlight belongs to the room, not the disc.
 */

type Props = {
  record: RecordItem
  side: 'A' | 'B'
  className?: string
}

const GROOVES = [
  48, 46.6, 45.1, 43.4, 41.5, 39.4, 37.1, 34.6, 32.0, 29.2, 26.4, 23.9, 21.8, 20.2, 19.0, 18.2,
]

export const Disc = memo(function Disc({ record, side, className }: Props) {
  const { cover } = record
  const uid = `${record.slug}-${side}`
  const ring = 14.4

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`sheen-${uid}`} cx="34%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </radialGradient>

        {/* The light in the room. Fixed in space; the disc turns beneath it. */}
        <linearGradient id={`lamp-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="46%" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="52%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <clipPath id={`clip-${uid}`}>
          <circle cx="50" cy="50" r="49" />
        </clipPath>

        <path id={`arc-${uid}`} d="M 50 37 a 13 13 0 1 1 -0.01 0" fill="none" />
      </defs>

      <circle cx="50" cy="50" r="49.2" fill="#0a0908" />

      <g clipPath={`url(#clip-${uid})`}>
        <g stroke={cover.ink} fill="none" strokeWidth="0.22">
          {GROOVES.map((r, i) => (
            <circle key={r} cx="50" cy="50" r={r} opacity={0.07 + ((i * 7) % 5) * 0.018} />
          ))}
        </g>

        {/* The unplayed land between the last groove and the label. */}
        <circle cx="50" cy="50" r="18.2" fill="#080706" />
        <circle
          cx="50"
          cy="50"
          r="18"
          stroke={cover.ink}
          strokeOpacity="0.12"
          strokeWidth="0.3"
          fill="none"
        />
      </g>

      <circle cx="50" cy="50" r="49.2" fill={`url(#sheen-${uid})`} />
      <circle cx="50" cy="50" r="49.2" fill={`url(#lamp-${uid})`} />

      <circle
        cx="50"
        cy="50"
        r="49"
        fill="none"
        stroke={cover.ink}
        strokeOpacity="0.2"
        strokeWidth="0.5"
      />

      {/* The label. This is what makes the turn visible. */}
      <g>
        <circle cx="50" cy="50" r={ring} fill={cover.ink} opacity="0.94" />
        <circle cx="50" cy="50" r={ring} fill="none" stroke={cover.accent} strokeWidth="0.6" />
        <circle
          cx="50"
          cy="50"
          r={ring - 2.6}
          fill="none"
          stroke={cover.ground}
          strokeOpacity="0.4"
          strokeWidth="0.25"
        />

        <text
          fontSize="2.9"
          fill={cover.ground}
          fontFamily="var(--font-mono)"
          letterSpacing="0.6"
          opacity="0.82"
        >
          <textPath href={`#arc-${uid}`} startOffset="3%">
            {`${bareCatalog(record.catalogNumber)} · ${side} · ${record.rpm}RPM · ${record.label.toUpperCase()}`}
          </textPath>
        </text>

        <text
          x="50"
          y="46.4"
          textAnchor="middle"
          fontSize="4.4"
          fill={cover.ground}
          fontFamily="var(--font-display)"
          letterSpacing="0.2"
        >
          {side}
        </text>
        <text
          x="50"
          y="56.6"
          textAnchor="middle"
          fontSize="2.4"
          fill={cover.ground}
          fontFamily="var(--font-mono)"
          letterSpacing="1.1"
          opacity="0.7"
        >
          {bareCatalog(record.catalogNumber)}
        </text>
      </g>

      <circle cx="50" cy="50" r="1.15" fill="#080706" />
      <circle cx="50" cy="50" r="2" fill="none" stroke={cover.ground} strokeOpacity="0.5" strokeWidth="0.3" />
    </svg>
  )
})
