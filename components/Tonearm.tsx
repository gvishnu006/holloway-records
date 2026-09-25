'use client'

import { cx } from '@/lib/format'

/**
 * The tonearm.
 *
 * Pivot at (104, 24) in a 120-unit box, needle landing at (86, 60) when the
 * stylus is in the groove. The rest position is a 23° swing out, which is
 * roughly what a real arm does and — more importantly — is the smallest swing
 * that reads clearly at thumbnail size.
 *
 * Rotation is applied about the pivot via transform-box: view-box so the
 * lengths resolve in SVG user units rather than the element's own box.
 */

type Props = {
  /** 'idle' = parked. 'dropping' = the needle fall. 'locked' = in the groove. */
  state: 'idle' | 'dropping' | 'locked'
  className?: string
}

export function Tonearm({ state, className }: Props) {
  const origin = { transformBox: 'view-box', transformOrigin: '104px 24px' } as const

  return (
    <svg
      viewBox="0 0 120 120"
      className={cx('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Pivot bearing and gimbal. */}
      <circle cx="104" cy="24" r="7.4" fill="#0b0a09" />
      <circle
        cx="104"
        cy="24"
        r="7.4"
        fill="none"
        stroke="var(--color-paper)"
        strokeOpacity="0.22"
        strokeWidth="0.7"
      />
      <circle cx="104" cy="24" r="3.1" fill="#1b1815" />
      <circle
        cx="104"
        cy="24"
        r="3.1"
        fill="none"
        stroke="var(--color-paper)"
        strokeOpacity="0.3"
        strokeWidth="0.5"
      />

      {/* Anti-skate and the weight behind the pivot. */}
      <g style={origin}>
        <path
          d="M104 24 L112 12"
          stroke="var(--color-paper-dim)"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle
          cx="112.6"
          cy="11.2"
          r="3.2"
          fill="#151311"
          stroke="var(--color-paper)"
          strokeOpacity="0.28"
          strokeWidth="0.5"
        />
      </g>

      {/* The arm itself. */}
      <g
        style={{
          ...origin,
          animation: state === 'dropping' ? 'needle-fall 900ms var(--ease-drop) both' : undefined,
          transform: state === 'locked' ? 'rotate(0deg)' : state === 'idle' ? 'rotate(-23deg)' : undefined,
        }}
      >
        <path
          d="M104 24 C 99 30, 97.5 37, 94 43 C 91.5 47.5, 88.5 53.5, 86 60"
          fill="none"
          stroke="#16130f"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M104 24 C 99 30, 97.5 37, 94 43 C 91.5 47.5, 88.5 53.5, 86 60"
          fill="none"
          stroke="var(--color-paper)"
          strokeOpacity="0.5"
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        {/* Headshell. */}
        <path d="M87.4 57.2 L84.6 62.8 L81.6 61.4 L84.4 55.6 Z" fill="#1a1714" />
        <path
          d="M87.4 57.2 L84.6 62.8 L81.6 61.4 L84.4 55.6 Z"
          fill="none"
          stroke="var(--color-amber)"
          strokeOpacity="0.55"
          strokeWidth="0.55"
        />

        {/* Stylus. */}
        <path d="M83 62 L82.1 65.6" stroke="var(--color-amber-bright)" strokeWidth="0.7" strokeLinecap="round" />
        <circle cx="82" cy="66.2" r="0.75" fill="var(--color-amber-bright)" />
      </g>
    </svg>
  )
}
