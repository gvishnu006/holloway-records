'use client'

import { useEffect } from 'react'

/**
 * Rotation for a record.
 *
 * A CSS keyframe would be the obvious thing here, but a platter has to be able
 * to change speed without jumping — coasting at 25rpm on hover, then spinning
 * up to a true 33⅓ when the needle lands. So we drive it with the Web
 * Animations API and read the live angle back out before starting the new
 * animation, which means the change is genuinely seamless.
 */

/** Revolutions per minute. 33⅓ rpm is 20 seconds per turn. 45rpm is 13.33. */
export const RPM_33 = 33 + 1 / 3
export const RPM_45 = 45

/** The coasting speed on hover. Deliberately slower than the real thing. */
export const RPM_COAST = 25

export function useSpin(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  rpm: number,
  /** Milliseconds to ramp up from a standstill to full speed. */
  spinUp = 0,
) {
  useEffect(() => {
    const el = ref.current
    if (!active || !el || typeof el.animate !== 'function') return

    // Whatever angle we are already at becomes angle zero for the new lap.
    const t = getComputedStyle(el).transform
    let current = 0
    if (t && t !== 'none') {
      const m = new DOMMatrixReadOnly(t)
      current = (Math.atan2(m.b, m.a) * 180) / Math.PI
    }

    const seconds = 60 / rpm
    const anim = el.animate(
      [{ transform: `rotate(${current}deg)` }, { transform: `rotate(${current + 360}deg)` }],
      { duration: seconds * 1000, iterations: Infinity, easing: 'linear' },
    )

    if (spinUp > 0) {
      // Ramp the playback rate rather than the angle, so there is no visible
      // acceleration curve to hide behind.
      const start = performance.now()
      let frame = 0
      const ramp = (now: number) => {
        const p = Math.min(1, (now - start) / spinUp)
        anim.playbackRate = 0.15 + 0.85 * p * p
        if (p < 1) frame = requestAnimationFrame(ramp)
      }
      frame = requestAnimationFrame(ramp)
      return () => {
        cancelAnimationFrame(frame)
        anim.cancel()
      }
    }

    return () => anim.cancel()
  }, [ref, active, rpm, spinUp])
}
