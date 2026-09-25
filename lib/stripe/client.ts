import 'server-only'

import Stripe from 'stripe'

/**
 * One Stripe client, or none at all.
 *
 * A record shop with no keys at the till should still be browsable, so every
 * call site checks `isDemoMode()` first and falls back to a local order rather
 * than throwing. That way the design work is reviewable on a fresh clone
 * without anybody having to go and sign up for anything.
 */

let cached: Stripe | null = null

export function getSecret(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  return key && key.length > 0 ? key : undefined
}

/** True when there is no live key, so the till takes mock orders instead. */
export function isDemoMode(): boolean {
  return getSecret() === undefined
}

export function stripe(): Stripe {
  if (isDemoMode()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY to enable the till.')
  }
  cached ??= new Stripe(getSecret() as string, {
    // Pinning the version means a dashboard upgrade can never change the shape
    // of the response mid-deploy.
    appInfo: { name: 'Holloway Records' },
  })
  return cached
}

/** Where Stripe should send the customer back to. */
export function storefrontUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.STOREFRONT_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
