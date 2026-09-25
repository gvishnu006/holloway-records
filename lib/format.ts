/** Small, opinionated formatting helpers. Everything money is in pence. */

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
})

/** £34.00 */
export function money(pence: number): string {
  return gbp.format(pence / 100)
}

/** £34 — no pence, for shelf labels where the pence is noise. */
export function moneyShort(pence: number): string {
  return `£${Math.floor(pence / 100)}`
}

export function pluralRecords(n: number): string {
  return n === 1 ? '1 record' : `${n} records`
}

/** 2026-09-04 → 4 September 2026 */
const addedFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function addedDate(iso: string): string {
  return addedFmt.format(new Date(`${iso}T12:00:00Z`))
}

/** "PTM-4 [DUB]" → "PTM-4" */
export function bareCatalog(catalogNumber: string): string {
  return catalogNumber.replace(/\s*\[.*\]\s*$/, '').trim()
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** True when the shop is open right now, in shop-local time (Europe/London). */
export function isOpenNow(hours: ReadonlyArray<{ day: string; open: string; close: string }>): boolean {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/London',
    }).formatToParts(now)

    const day = parts.find((p) => p.type === 'weekday')?.value ?? ''
    const time = `${parts.find((p) => p.type === 'hour')?.value ?? '00'}:${parts.find((p) => p.type === 'minute')?.value ?? '00'}`

    return hours.some((h) => h.day === day && time >= h.open && time < h.close)
  } catch {
    return false
  }
}

/** Clamp helper used all over the turntable maths. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
