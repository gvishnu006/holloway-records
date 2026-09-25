'use client'

import { CartProvider } from '@/lib/store/cart'
import { PlayerProvider } from '@/lib/store/player'

/** Both stores are client-side. This is the one place they get wired in. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <CartProvider>{children}</CartProvider>
    </PlayerProvider>
  )
}
