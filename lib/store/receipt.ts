'use client'

/**
 * Demo receipts, kept in the browser.
 *
 * In demo mode the order ledger is in memory, and a serverless platform will
 * happily route the receipt request to an instance that never saw the order.
 * The checkout response therefore hands the receipt straight to the browser,
 * and it is kept in sessionStorage so a reload still shows the same receipt.
 *
 * This is a demo convenience, not a system of record: real orders are
 * reconciled against Stripe, which is the only durable copy.
 */

const PREFIX = 'holloway.receipt.'

export type Receipt = {
  reference: string
  status: 'pending' | 'paid' | 'demo'
  email: string | null
  placedAt: string
  subtotal: number
  postage: number
  total: number
  lines: Array<{ slug: string; qty: number; title: string; price: number }>
}

function key(reference: string) {
  return `${PREFIX}${reference.trim().toUpperCase()}`
}

export function saveReceipt(receipt: Receipt): void {
  try {
    sessionStorage.setItem(key(receipt.reference), JSON.stringify(receipt))
  } catch {
    // Private browsing, or storage is full. The order is still in the ledger.
  }
}

export function readReceipt(reference: string): Receipt | null {
  try {
    const raw = sessionStorage.getItem(key(reference))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Receipt
    return parsed?.reference === key(reference).slice(PREFIX.length) ? parsed : null
  } catch {
    return null
  }
}
