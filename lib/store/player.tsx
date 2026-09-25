'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { RECORDS } from '../catalog'
import { player, type PlayerState } from '../audio/engine'

type PlayerApi = {
  state: PlayerState
  /** Slug of the record whose preview is loaded, or null. */
  playingSlug: string | null
  isPlaying: (slug: string) => boolean
  toggle: (slug: string) => void
  stop: () => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerApi | null>(null)

const PREVIEWS = new Map(RECORDS.map((r) => [r.slug, r]))

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(() => player.state)

  useEffect(() => player.subscribe(setState), [])

  // Chrome throttles timers in background tabs, which makes the sequencer
  // stutter. Pause the surface noise instead so a hidden tab is quiet.
  useEffect(() => {
    const onVisibility = () => player.setSuspended(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => () => player.stop(), [])

  const toggle = useCallback((slug: string) => {
    const record = PREVIEWS.get(slug)
    if (!record) return
    void player.play(slug, record.preview)
  }, [])

  const api = useMemo<PlayerApi>(
    () => ({
      state,
      playingSlug: state.slug,
      isPlaying: (slug: string) => state.status !== 'idle' && state.slug === slug,
      toggle,
      stop: () => player.stop(),
      setVolume: (v: number) => player.setVolume(v),
    }),
    [state, toggle],
  )

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return ctx
}
