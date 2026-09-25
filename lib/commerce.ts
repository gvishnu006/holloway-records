/**
 * The money rules of the shop, in one place, safe to import from the client.
 *
 * Postage is a fact about the business, not about Stripe, so it lives where
 * both the browser and the server can read it without dragging `server-only`
 * code into the client bundle.
 */

export const POSTAGE = 350
export const FREE_POSTAGE_OVER = 7500

export function postageFor(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FREE_POSTAGE_OVER) return 0
  return POSTAGE
}
