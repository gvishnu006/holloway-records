import type { Cover, CoverMotif } from '@/lib/catalog'
import { cx } from '@/lib/format'

/**
 * Twelve sleeves, drawn from scratch.
 *
 * A record shop's shelves are the most varied thing you will ever look at, so
 * the covers here are not one template recoloured. Each record has an art
 * direction, and these are the twelve we drew for this month's crates. The
 * `seed` nudges positions so even two records sharing a motif do not land on
 * top of each other.
 */

function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 7
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

type Props = {
  cover: Cover
  className?: string
  title?: string
}

const MOTIFS: Record<CoverMotif, (c: Cover) => React.ReactNode> = {
  /* Rays fanning up from just below the horizon, with the sun half-set. */
  sunburst: (c) => {
    const rays = Array.from({ length: 21 }, (_, i) => {
      const a = Math.PI + (i / 20) * Math.PI
      return { x1: 60, y1: 104, x2: 60 + Math.cos(a) * 150, y2: 104 + Math.sin(a) * 150, i }
    })
    return (
      <>
        <g stroke={c.ink} strokeWidth={1.4} opacity={0.9}>
          {rays.map((r) => (
            <line
              key={r.i}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              opacity={r.i % 2 ? 0.35 : 0.8}
            />
          ))}
        </g>
        <circle cx={60} cy={104} r={30} fill={c.accent} />
        <path d="M0 104 H120" stroke={c.ink} strokeWidth={2} />
        <rect x={0} y={104} width={120} height={16} fill={c.ink} opacity={0.9} />
      </>
    )
  },

  /* Three plates slid across each other. Print shop registration, off. */
  offset: (c) => (
    <>
      <rect x={16} y={20} width={64} height={64} fill={c.ink} opacity={0.9} />
      <rect x={38} y={36} width={66} height={64} fill={c.accent} opacity={0.85} />
      <rect x={30} y={56} width={58} height={52} fill={c.ground} />
      <rect x={30} y={56} width={58} height={52} fill="none" stroke={c.ink} strokeWidth={1.2} />
    </>
  ),

  /* A level meter that never settles. Sixteen columns, 1970s mastering house. */
  ledger: (c) => {
    const r = rng(c.seed)
    return (
      <g>
        {Array.from({ length: 16 }, (_, i) => {
          const h = 8 + r() * 78
          return (
            <rect
              key={i}
              x={10 + i * 6.4}
              y={104 - h}
              width={3.2}
              height={h}
              fill={i === 9 ? c.accent : c.ink}
              opacity={i === 9 ? 1 : 0.55 + r() * 0.4}
            />
          )
        })}
        <path d="M0 104 H120" stroke={c.ink} strokeWidth={1.2} opacity={0.8} />
      </g>
    )
  },

  /* A strip of paper torn off something bigger. */
  torn: (c) => {
    const r = rng(c.seed)
    const pts: string[] = []
    for (let x = 0; x <= 120; x += 7) pts.push(`${x},${40 + (r() - 0.5) * 11}`)
    const edge = pts.join(' L')
    return (
      <>
        <path d={`M${edge} L120,38 L0,38 Z`} fill={c.ink} opacity={0.92} />
        <path d={`M${edge}`} fill="none" stroke={c.accent} strokeWidth={1.6} />
        <g stroke={c.ink} strokeWidth={0.8} opacity={0.5}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={8 + i * 13} y1={88} x2={8 + i * 13} y2={104} />
          ))}
        </g>
      </>
    )
  },

  /* Almost nothing. One line, one dot, and a lot of air. */
  hairline: (c) => (
    <>
      <line x1={22} y1={14} x2={22} y2={106} stroke={c.ink} strokeWidth={0.8} opacity={0.7} />
      <circle cx={70} cy={60} r={26} fill="none" stroke={c.ink} strokeWidth={0.6} opacity={0.35} />
      <circle cx={70} cy={60} r={5} fill={c.accent} />
      <text
        x={70}
        y={104}
        textAnchor="middle"
        fill={c.ink}
        fontSize={7}
        letterSpacing={3}
        fontFamily="var(--font-mono)"
        opacity={0.7}
      >
        SOL
      </text>
    </>
  ),

  /* Something is passing in front of something else. */
  eclipse: (c) => {
    const r = rng(c.seed)
    return (
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <circle
            key={i}
            cx={60}
            cy={60}
            r={12 + i * 7}
            fill="none"
            stroke={c.ink}
            strokeWidth={i === 3 ? 1.4 : 0.6}
            opacity={0.5 - i * 0.045}
          />
        ))}
        <circle
          cx={60 + (r() * 10 - 5)}
          cy={60 + (r() * 8 - 4)}
          r={20}
          fill={c.accent}
          opacity={0.9}
        />
      </>
    )
  },

  /* Three bars, in time, at different heights. A piano, roughly. */
  thirds: (c) => {
    const r = rng(c.seed)
    const heights = [58, 88, 40]
    return (
      <g>
        {heights.map((h, i) => (
          <rect
            key={i}
            x={16 + i * 32}
            y={96 - h - r() * 6}
            width={18}
            height={h + r() * 6}
            fill={i === 1 ? c.accent : c.ink}
            opacity={i === 1 ? 1 : 0.85}
          />
        ))}
        <line x1={8} y1={96} x2={112} y2={96} stroke={c.ink} strokeWidth={1.2} />
      </g>
    )
  },

  /* The waterline, and everything under it. */
  strata: (c) => {
    const r = rng(c.seed)
    let y = 24
    return (
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const h = 4 + r() * 12
          y += h
          return (
            <rect
              key={i}
              x={0}
              y={y}
              width={120}
              height={h + 2}
              fill={i === 3 ? c.accent : c.ink}
              opacity={0.14 + (i / 9) * 0.5}
            />
          )
        })}
        <line x1={0} y1={24} x2={120} y2={24} stroke={c.accent} strokeWidth={1.4} />
      </g>
    )
  },

  /* Pointing at the pier. */
  chevron: (c) => (
    <g strokeLinecap="square" fill="none">
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={`M${8 + i * 4} ${30 + i * 12} L${60 + i * 4} ${30 + i * 12} L${8 + i * 4} ${44 + i * 12}`}
          stroke={i % 2 ? c.ink : c.accent}
          strokeWidth={3}
          opacity={0.35 + i * 0.1}
        />
      ))}
    </g>
  ),

  /* The title, more or less literally. */
  barbwire: (c) => {
    const r = rng(c.seed)
    return (
      <g>
        <path
          d="M-4 66 C 14 40, 28 88, 46 62 S 78 38, 96 66 S 116 82, 126 58"
          fill="none"
          stroke={c.ink}
          strokeWidth={1.6}
        />
        {Array.from({ length: 14 }, (_, i) => {
          const x = 4 + i * 8.6
          const y = 66 + Math.sin(i * 0.9 + r()) * 9
          return <line key={i} x1={x} y1={y} x2={x + 5} y2={y - 7} stroke={c.accent} strokeWidth={1} />
        })}
        <line x1={0} y1={30} x2={120} y2={30} stroke={c.ink} strokeWidth={0.5} opacity={0.4} />
        <line x1={0} y1={102} x2={120} y2={102} stroke={c.ink} strokeWidth={0.5} opacity={0.4} />
      </g>
    )
  },

  /* A photograph, printed too dark, then screened. */
  halftone: (c) => {
    const r = rng(c.seed)
    return (
      <g>
        {Array.from({ length: 11 }, (_, row) =>
          Array.from({ length: 11 }, (_, col) => {
            const rad = 0.6 + r() * 2.6
            return (
              <circle
                key={`${row}-${col}`}
                cx={9 + col * 10.2}
                cy={9 + row * 10.2}
                r={rad}
                fill={(row + col) % 7 === 0 ? c.accent : c.ink}
                opacity={0.35 + r() * 0.55}
              />
            )
          }),
        )}
      </g>
    )
  },

  /* A speaker, from the front, which is how you meet a sound system. */
  cone: (c) => (
    <>
      <rect
        x={14}
        y={14}
        width={92}
        height={92}
        fill="none"
        stroke={c.ink}
        strokeWidth={1.4}
        opacity={0.6}
      />
      {[34, 27, 20, 13, 7].map((r, i) => (
        <circle
          key={r}
          cx={60}
          cy={60}
          r={r}
          fill="none"
          stroke={i === 2 ? c.accent : c.ink}
          strokeWidth={i === 2 ? 2 : 1.2}
          opacity={0.9 - i * 0.08}
        />
      ))}
      <circle cx={60} cy={60} r={3.4} fill={c.accent} />
    </>
  ),
}

export function SleeveArt({ cover, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cx('block h-full w-full', className)}
      role="img"
      aria-label={title ? `${title} — sleeve artwork` : 'Sleeve artwork'}
      shapeRendering="geometricPrecision"
    >
      <rect width={120} height={120} fill={cover.ground} />
      {MOTIFS[cover.motif](cover)}
      {/* Plate edge — the print never quite reaches the trim. */}
      <rect width={120} height={120} fill="none" stroke={cover.ink} strokeWidth={0.4} opacity={0.16} />
    </svg>
  )
}
