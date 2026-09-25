/**
 * The shelf strip.
 *
 * A shop with twelve records does not need a carousel, but it does need a
 * ticker: the way a display case catches your eye as you walk past. The list
 * is duplicated and translated -50% so the loop has no seam.
 */

type Props = {
  items: string[]
  /** Seconds for one full pass. Slower is classier. */
  duration?: number
  reverse?: boolean
}

export function Marquee({ items, duration = 58, reverse = false }: Props) {
  const run = [...items, ...items]

  return (
    <div
      className="relative overflow-hidden border-y border-paper/8 bg-shelf py-3.5"
      role="presentation"
    >
      {/* Feather the ends so the text enters rather than appears. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-shelf to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-shelf to-transparent"
        aria-hidden="true"
      />

      <div
        className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap motion-reduce:animate-none motion-reduce:justify-center motion-reduce:gap-6 motion-reduce:overflow-x-auto"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
        aria-hidden="true"
      >
        {run.map((text, i) => (
          <span key={`${text}-${i}`} className="cat flex items-center gap-10 text-paper-faint">
            {text}
            <span className="text-amber/60" aria-hidden="true">
              ✳
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
