/**
 * The turntable.
 *
 * There are no audio files in this project. Every preview is written out here,
 * one bar at a time, by a small step sequencer running on the Web Audio API —
 * which means the shop weighs nothing, previews start instantly, and each
 * record can have its own tempo, key and instrumentation.
 *
 * The important half is the "record" half. Raw synthesis sounds like a synth.
 * To make it sound like it is coming off a groove we run the whole mix through:
 *
 *   music ──▶ wow & flutter (slow pitch drift) ──▶ groove lowpass ──▶ comp ──┐
 *   crackle ─────────────────────────────────────────────────────────────────┴─▶ out
 *
 * ...and we add continuous surface noise plus randomly scheduled pops, because
 * the pops are most of what people recognise as "a record".
 */

import type { Preview } from '../catalog'

/* ── Scales. Semitone offsets from the root. ───────────────────────────── */

const SCALES: Record<Preview['scale'], number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  majorPent: [0, 2, 4, 7, 9],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
}

/** A1 = 55Hz. `degree` is a scale step, `octave` is in octaves above A1. */
function degreeHz(root: number, scaleName: Preview['scale'], degree: number, octave: number): number {
  const scale = SCALES[scaleName]
  const len = scale.length
  const wrapped = ((degree % len) + len) % len
  const oct = octave + Math.floor(degree / len)
  const semitone = (scale[wrapped] ?? 0) + oct * 12
  return 55 * 2 ** ((root + semitone) / 12)
}

/* ── Deterministic noise, so a record always crackles the same way ─────── */

function makeRandom(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

/* ── A short burst of cached white noise. Cheaper than making buffers live. */

let noiseBuffer: AudioBuffer | null = null

function getNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer
  const len = Math.floor(ctx.sampleRate * 2)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buf
  return buf
}

/* ── Voices ────────────────────────────────────────────────────────────── */

type VoiceName = Preview['voice']

/** Each voice schedules one note and cleans up after itself. */
const VOICES: Record<VoiceName, (ctx: AudioContext, at: number, out: AudioNode, freq: number, dur: number, vel: number) => void> = {
  // Sawtooth stack through a swept lowpass. Slightly growly, not quite a horn.
  brass(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.Q.value = 6

    for (const detune of [-7, 0, 6]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = freq
      o.detune.value = detune
      o.connect(f)
      o.start(at)
      o.stop(at + dur + 0.12)
    }

    const peak = Math.min(0.9, vel * 0.3)
    f.frequency.setValueAtTime(freq * 1.6, at)
    f.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 2.4), at + 0.06)
    f.frequency.exponentialRampToValueAtTime(Math.max(180, freq * 1.8), at + dur * 0.6)

    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.03)
    g.gain.setValueAtTime(peak, at + dur * 0.55)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.1)

    f.connect(g).connect(out)
  },

  // Two-operator FM. Bells and cheap electric pianos both live here.
  keys(ctx, at, out, freq, dur, vel) {
    const car = ctx.createOscillator()
    const mod = ctx.createOscillator()
    const modGain = ctx.createGain()
    const g = ctx.createGain()

    car.type = 'sine'
    car.frequency.value = freq
    mod.type = 'sine'
    mod.frequency.value = freq * 3.01
    modGain.gain.setValueAtTime(freq * 2.4, at)
    modGain.gain.exponentialRampToValueAtTime(freq * 0.15, at + dur * 0.5)

    mod.connect(modGain).connect(car.frequency)

    const peak = Math.min(0.85, vel * 0.28)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    car.connect(g).connect(out)
    car.start(at)
    mod.start(at)
    car.stop(at + dur + 0.1)
    mod.stop(at + dur + 0.1)
  },

  // Plucked string: a filtered sawtooth with a very fast decay and a little
  // noise for the finger noise.
  pluck(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.Q.value = 2.5

    for (const [type, detune, level] of [
      ['sawtooth', -4, 1],
      ['triangle', 5, 0.6],
    ] as const) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq
      o.detune.value = detune
      const og = ctx.createGain()
      og.gain.value = level
      o.connect(og).connect(f)
      o.start(at)
      o.stop(at + dur + 0.1)
    }

    const n = ctx.createBufferSource()
    n.buffer = getNoise(ctx)
    n.loop = true
    const nf = ctx.createBiquadFilter()
    nf.type = 'bandpass'
    nf.frequency.value = freq * 2
    nf.Q.value = 3
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(vel * 0.05, at)
    ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
    n.connect(nf).connect(ng).connect(g)
    n.start(at)
    n.stop(at + 0.06)

    const peak = Math.min(0.8, vel * 0.26)
    f.frequency.setValueAtTime(Math.min(12000, freq * 9), at)
    f.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.6), at + 0.2)

    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    f.connect(g).connect(out)
  },

  // Additive drawbars. Sine partials, no filter movement.
  organ(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const partials = [1, 2, 3, 4, 6]
    const levels = [1, 0.5, 0.28, 0.16, 0.08]

    partials.forEach((mult, i) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * mult
      const og = ctx.createGain()
      og.gain.value = (levels[i] ?? 0.1) * 0.5
      o.connect(og).connect(g)
      o.start(at)
      o.stop(at + dur + 0.1)
    })

    const peak = Math.min(0.8, vel * 0.24)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.02)
    g.gain.setValueAtTime(peak, at + dur * 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    g.connect(out)
  },

  // A sine fundamental with a 4th-partial ping. Hard mallets.
  marimba(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    const ping = ctx.createOscillator()
    ping.type = 'sine'
    ping.frequency.value = freq * 4.02
    const pg = ctx.createGain()

    const peak = Math.min(0.9, vel * 0.32)
    pg.gain.setValueAtTime(peak * 0.22, at)
    pg.gain.exponentialRampToValueAtTime(0.0001, at + 0.09)

    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.25, dur * 0.7))

    o.connect(g)
    ping.connect(pg).connect(g)
    g.connect(out)
    o.start(at)
    ping.start(at)
    o.stop(at + dur + 0.1)
    ping.stop(at + dur + 0.1)
  },

  // Detuned saws with vibrato and a long attack. Strings, basically.
  strings(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 2200
    f.Q.value = 1

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 4.8
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = freq * 0.006
    lfo.connect(lfoGain)

    for (const detune of [-11, -3, 4, 12]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = freq
      o.detune.value = detune
      lfoGain.connect(o.detune)
      o.connect(f)
      o.start(at)
      o.stop(at + dur + 0.2)
    }
    lfo.start(at)
    lfo.stop(at + dur + 0.2)

    const peak = Math.min(0.7, vel * 0.2)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.35, dur * 0.35))
    g.gain.setValueAtTime(peak, at + dur * 0.6)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.15)

    f.connect(g).connect(out)
  },

  // Square wave with a strong filter envelope and hard attack. Reeds and
  // cheap synths both live in this corner.
  reed(ctx, at, out, freq, dur, vel) {
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 1.8

    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = freq
    const o2 = ctx.createOscillator()
    o2.type = 'sawtooth'
    o2.frequency.value = freq
    o2.detune.value = 9

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 5.2
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = freq * 0.008
    lfo.connect(lfoGain)
    lfoGain.connect(o.detune)

    f.frequency.setValueAtTime(freq * 1.4, at)
    f.frequency.exponentialRampToValueAtTime(Math.min(9000, freq * 5), at + 0.08)
    f.frequency.exponentialRampToValueAtTime(freq * 2.2, at + dur * 0.7)

    const peak = Math.min(0.7, vel * 0.2)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.02)
    g.gain.setValueAtTime(peak, at + dur * 0.5)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.1)

    o.connect(f)
    o2.connect(f)
    f.connect(g).connect(out)

    for (const n of [o, o2, lfo]) {
      n.start(at)
      n.stop(at + dur + 0.2)
    }
  },
}

/* ── Drums ─────────────────────────────────────────────────────────────── */

type Drum = 'kick' | 'snare' | 'hat' | 'shaker' | 'rim'

const DRUMS: Record<Drum, (ctx: AudioContext, at: number, out: AudioNode, vel: number) => void> = {
  kick(ctx, at, out, vel) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(148, at)
    o.frequency.exponentialRampToValueAtTime(42, at + 0.09)
    g.gain.setValueAtTime(vel * 0.85, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.42)
    o.connect(g).connect(out)
    o.start(at)
    o.stop(at + 0.5)
  },

  snare(ctx, at, out, vel) {
    const n = ctx.createBufferSource()
    n.buffer = getNoise(ctx)
    n.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1900
    f.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(vel * 0.34, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.19)
    n.connect(f).connect(g).connect(out)
    n.start(at)
    n.stop(at + 0.25)

    const body = ctx.createOscillator()
    body.type = 'triangle'
    body.frequency.setValueAtTime(220, at)
    body.frequency.exponentialRampToValueAtTime(150, at + 0.08)
    const bg = ctx.createGain()
    bg.gain.setValueAtTime(vel * 0.16, at)
    bg.gain.exponentialRampToValueAtTime(0.0001, at + 0.12)
    body.connect(bg).connect(out)
    body.start(at)
    body.stop(at + 0.16)
  },

  hat(ctx, at, out, vel) {
    const n = ctx.createBufferSource()
    n.buffer = getNoise(ctx)
    n.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 7200
    const g = ctx.createGain()
    g.gain.setValueAtTime(vel * 0.11, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.045)
    n.connect(f).connect(g).connect(out)
    n.start(at)
    n.stop(at + 0.07)
  },

  shaker(ctx, at, out, vel) {
    const n = ctx.createBufferSource()
    n.buffer = getNoise(ctx)
    n.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 5200
    f.Q.value = 1.4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(vel * 0.1, at + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09)
    n.connect(f).connect(g).connect(out)
    n.start(at)
    n.stop(at + 0.12)
  },

  rim(ctx, at, out, vel) {
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = 410
    const g = ctx.createGain()
    g.gain.setValueAtTime(vel * 0.12, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.035)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1700
    f.Q.value = 2
    o.connect(f).connect(g).connect(out)
    o.start(at)
    o.stop(at + 0.06)
  },
}

/* ── Patterns, in sixteenths per bar (16) ──────────────────────────────── */

const PATTERNS: Record<Preview['drums'], number[]> = {
  // Straight four. Kick on 1 and 3, snare on 2 and 4, hats on the quavers.
  four: [1, 0, 2, 0, 3, 0, 2, 0, 1, 0, 2, 0, 3, 0, 2, 4],
  // Amenable to a shuffled kick. Deliberately behind on the snare.
  breakbeat: [1, 0, 0, 2, 0, 0, 3, 0, 0, 1, 0, 2, 0, 3, 0, 4],
  // Brushes: barely a kick, a lot of shaker, snare ghosted.
  brush: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 4],
  // Halftime — the sound-system pattern. Snare on 3, everything rolls.
  halftime: [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 4],
  none: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

const VELOCITY: Record<number, number> = { 1: 0.95, 2: 0.72, 3: 0.88, 4: 0.5 }

/* ── Player ────────────────────────────────────────────────────────────── */

export type PlayerStatus = 'idle' | 'dropping' | 'playing' | 'ending'

export type PlayerState = {
  status: PlayerStatus
  /** Slug of the record currently on the platter, if any. */
  slug: string | null
  /** 0–1 through the preview. */
  progress: number
  /** Seconds remaining, rounded. */
  remaining: number
  volume: number
  /** True while the tonearm is swinging in. */
  needleDropping: boolean
}

const BARS = 6
const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD = 0.14

class PreviewPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private noiseBus: GainNode | null = null

  private timer: number | null = null
  private raf: number | null = null
  private preview: Preview | null = null
  private startSlug: string | null = null
  private startedAt = 0
  private nextStep = 0
  private stepDur = 0
  private popAt: number | null = null
  private listeners = new Set<(s: PlayerState) => void>()

  state: PlayerState = {
    status: 'idle',
    slug: null,
    progress: 0,
    remaining: 0,
    volume: 0.7,
    needleDropping: false,
  }

  subscribe(fn: (s: PlayerState) => void): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private emit(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch }
    for (const fn of this.listeners) fn(this.state)
  }

  get isPlaying(): boolean {
    return this.state.status !== 'idle'
  }

  /* ── Graph ───────────────────────────────────────────────────────────── */

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx

    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = this.state.volume

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.knee.value = 22
    comp.ratio.value = 3.4
    comp.attack.value = 0.006
    comp.release.value = 0.24

    comp.connect(master).connect(ctx.destination)
    this.master = master

    // Wow & flutter: a very short delay modulated slowly. This is what makes
    // a synthesised note sound like it came off a slightly worn record.
    const wow = ctx.createDelay(0.05)
    wow.delayTime.value = 0.006
    const wowLfo = ctx.createOscillator()
    wowLfo.frequency.value = 0.55
    const wowAmt = ctx.createGain()
    wowAmt.gain.value = 0.0016
    wowLfo.connect(wowAmt).connect(wow.delayTime)
    wowLfo.start()

    // The stylus. Nothing above 5k ever comes off a 1970s press.
    const groove = ctx.createBiquadFilter()
    groove.type = 'lowpass'
    groove.frequency.value = 5200
    groove.Q.value = 0.6

    const air = ctx.createBiquadFilter()
    air.type = 'highpass'
    air.frequency.value = 42

    const music = ctx.createGain()
    music.gain.value = 0.9
    music.connect(wow).connect(groove).connect(air).connect(comp)
    this.musicBus = music

    // Surface noise. Bed first, then a slow breath so it is never static.
    const noise = ctx.createGain()
    noise.gain.value = 0.0001
    noise.connect(comp)
    this.noiseBus = noise

    const bed = ctx.createBufferSource()
    bed.buffer = getNoise(ctx)
    bed.loop = true
    const bedFilter = ctx.createBiquadFilter()
    bedFilter.type = 'bandpass'
    bedFilter.frequency.value = 3400
    bedFilter.Q.value = 0.5
    const bedGain = ctx.createGain()
    bedGain.gain.value = 0.05
    bed.connect(bedFilter).connect(bedGain).connect(noise)
    bed.start()

    const breath = ctx.createOscillator()
    breath.frequency.value = 0.09
    const breathAmt = ctx.createGain()
    breathAmt.gain.value = 0.022
    breath.connect(breathAmt).connect(bedGain.gain)
    breath.start()

    this.startCrackle()
    return ctx
  }

  /** Pops: the little transients you get between tracks and over silence. */
  private startCrackle() {
    if (!this.ctx || !this.noiseBus) return
    const ctx = this.ctx
    const rand = makeRandom(this.preview?.seed ?? 7)

    const tick = () => {
      const bus = this.noiseBus
      if (!bus || this.state.status === 'idle') return
      const g = ctx.createGain()
      g.connect(bus)
      const amp = 0.02 + rand() * 0.075
      g.gain.setValueAtTime(amp, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.006 + rand() * 0.02)
      window.setTimeout(() => g.disconnect(), 500)
      this.popAt = window.setTimeout(tick, 220 + rand() * 1500)
    }
    this.popAt = window.setTimeout(tick, 400)
  }

  private stopCrackle() {
    if (this.popAt !== null) {
      window.clearTimeout(this.popAt)
      this.popAt = null
    }
  }

  /* ── Transport ──────────────────────────────────────────────────────── */

  async play(slug: string, preview: Preview) {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()

    // Already playing this one — treat the click as stop.
    if (this.state.status !== 'idle' && this.state.slug === slug) {
      this.stop()
      return
    }

    this.stop(true)
    this.preview = preview
    this.startSlug = slug
    this.stepDur = 60 / preview.bpm / 4

    const barSeconds = this.stepDur * 16
    const total = barSeconds * BARS

    if (this.noiseBus) {
      this.noiseBus.gain.cancelScheduledValues(ctx.currentTime)
      this.noiseBus.gain.setValueAtTime(0.0001, ctx.currentTime)
      this.noiseBus.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.35)
    }

    this.emit({
      slug,
      status: 'dropping',
      progress: 0,
      remaining: Math.round(total),
      needleDropping: true,
    })

    // The needle. A thunk, then the crackle swells, then the music.
    this.thunk(ctx)

    const dropAt = ctx.currentTime + 0.34
    this.startedAt = dropAt
    this.nextStep = 0
    this.schedule()
    this.timer = window.setInterval(() => this.schedule(), LOOKAHEAD_MS)
    this.tickProgress(dropAt, total)

    window.setTimeout(() => this.emit({ needleDropping: false, status: 'playing' }), 900)
  }

  /** The sound of a stylus finding the groove. Felt more than heard. */
  private thunk(ctx: AudioContext) {
    if (!this.master) return
    const t = ctx.currentTime

    const n = ctx.createBufferSource()
    n.buffer = getNoise(ctx)
    n.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(900, t)
    f.frequency.exponentialRampToValueAtTime(120, t + 0.16)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    n.connect(f).connect(g).connect(this.master)
    n.start(t)
    n.stop(t + 0.3)

    const body = ctx.createOscillator()
    body.type = 'sine'
    body.frequency.setValueAtTime(320, t)
    body.frequency.exponentialRampToValueAtTime(70, t + 0.1)
    const bg = ctx.createGain()
    bg.gain.setValueAtTime(0.28, t)
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    body.connect(bg).connect(this.master)
    body.start(t)
    body.stop(t + 0.3)
  }

  private schedule() {
    const ctx = this.ctx
    const preview = this.preview
    const music = this.musicBus
    if (!ctx || !preview || !music || !this.master) return

    const totalSteps = BARS * 16
    const swing = preview.swing * this.stepDur

    while (this.nextStep < totalSteps) {
      const t = this.startedAt + this.nextStep * this.stepDur
      if (t > ctx.currentTime + SCHEDULE_AHEAD) break

      // Push odd sixteenths late for a shuffle.
      const swung = this.nextStep % 2 === 1 ? t + swing : t
      this.playStep(preview, music, this.nextStep, swung)

      this.nextStep += 1
    }

    // Finished scheduling — let it ring, then fade and stop.
    if (this.nextStep >= totalSteps) {
      const endAt = this.startedAt + totalSteps * this.stepDur
      const fade = ctx.createGain()
      fade.gain.value = 1
      music.disconnect()
      music.connect(fade).connect(this.master)
      fade.gain.setValueAtTime(1, endAt)
      fade.gain.linearRampToValueAtTime(0.0001, endAt + 0.5)
      if (this.timer !== null) window.clearInterval(this.timer)
      this.timer = window.setTimeout(() => this.stop(), Math.max(0, (endAt - ctx.currentTime + 0.7) * 1000))
    }
  }

  private playStep(preview: Preview, out: AudioNode, step: number, t: number) {
    const ctx = this.ctx
    if (!ctx) return

    const bar = Math.floor(step / 16)
    const inBar = step % 16
    const inPhrase = bar % preview.progression.length
    const chord = preview.progression[inPhrase] ?? [0, 2, 4]

    // Bar 0 is a bar of groove only — the record gets going before the tune.
    const introBar = bar === 0

    // Drums
    if (preview.drums !== 'none' && !(introBar && inBar % 4 !== 0)) {
      const hit = PATTERNS[preview.drums][inBar]
      if (hit) {
        const drum: Drum = hit === 1 ? 'kick' : hit === 2 ? 'snare' : hit === 3 ? 'hat' : 'rim'
        DRUMS[drum](ctx, t, out, VELOCITY[hit] ?? 0.5)
      }
      if (inBar % 2 === 0) DRUMS.shaker(ctx, t, out, 0.5)
    }

    if (introBar) return

    // Bass, on the root, with an occasional passing note.
    if (inBar % 4 === 0 || (inBar % 8 === 6 && bar % 2 === 1)) {
      const degree = chord[0] ?? 0
      const hz = degreeHz(preview.root, preview.scale, degree, 0)
      this.bassNote(out, hz, t, this.stepDur * 3.2)
    }

    // Chords: comped on the off-beats for the swung patterns, held for the rest.
    const compStep = preview.swing > 0.1 ? 2 : 4
    if (inBar % compStep === 0 && inBar < 14) {
      for (const degree of chord) {
        const hz = degreeHz(preview.root, preview.scale, degree, 2)
        VOICES[preview.voice](ctx, t, out, hz, this.stepDur * (compStep - 0.4), 0.85)
      }
    }

    // A melody line on top, derived from the chord so it can never clash.
    if (inBar % 2 === 0 && bar >= 2) {
      const shape = [0, 2, 1, 3, 2, 0, 1, 2]
      const idx = (bar * 4 + inBar / 2) % shape.length
      const lift = shape[idx] ?? 0
      const hz = degreeHz(preview.root, preview.scale, (chord[lift % chord.length] ?? 0) + lift, 3)
      VOICES[preview.voice](ctx, t, out, hz, this.stepDur * 1.6, 0.6)
    }
  }

  private bassNote(out: AudioNode, hz: number, t: number, dur: number) {
    const ctx = this.ctx
    if (!ctx) return

    const o = ctx.createOscillator()
    const sub = ctx.createOscillator()
    const f = ctx.createBiquadFilter()
    const g = ctx.createGain()

    o.type = 'triangle'
    o.frequency.value = hz
    sub.type = 'sine'
    sub.frequency.value = hz / 2

    f.type = 'lowpass'
    f.frequency.setValueAtTime(520, t)
    f.frequency.exponentialRampToValueAtTime(180, t + dur * 0.7)
    f.Q.value = 1.2

    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.014)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

    const subG = ctx.createGain()
    subG.gain.value = 0.55

    o.connect(f)
    sub.connect(subG).connect(f)
    f.connect(g).connect(out)
    o.start(t)
    sub.start(t)
    o.stop(t + dur + 0.08)
    sub.stop(t + dur + 0.08)
  }

  private tickProgress(startAt: number, total: number) {
    const step = () => {
      if (!this.ctx) return
      const elapsed = this.ctx.currentTime - startAt
      if (elapsed >= 0) {
        const p = Math.min(1, elapsed / total)
        this.emit({
          progress: p,
          remaining: Math.max(0, Math.ceil(total - elapsed)),
          status:
            p > 0.93 ? 'ending' : this.state.status === 'dropping' ? 'playing' : this.state.status,
        })
      }
      this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  /* ── Output ──────────────────────────────────────────────────────────── */

  setVolume(v: number) {
    const vol = Math.max(0, Math.min(1, v))
    this.emit({ volume: vol })
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.02)
    }
  }

  stop(silent = false) {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      window.clearTimeout(this.timer)
      this.timer = null
    }
    if (this.raf !== null) {
      cancelAnimationFrame(this.raf)
      this.raf = null
    }
    this.stopCrackle()

    if (this.ctx && this.noiseBus) {
      this.noiseBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.noiseBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08)
    }
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.musicBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05)
    }

    const slug = this.startSlug
    this.startSlug = null
    this.preview = null
    this.emit({
      status: 'idle',
      slug: silent ? slug : null,
      progress: 0,
      remaining: 0,
      needleDropping: false,
    })

    // Let the fade land, then hand the graph back to silence.
    window.setTimeout(() => {
      if (this.state.status !== 'idle') return
      if (this.musicBus && this.ctx) this.musicBus.gain.setValueAtTime(0.9, this.ctx.currentTime)
      if (this.noiseBus && this.ctx) this.noiseBus.gain.setValueAtTime(0.0001, this.ctx.currentTime)
    }, 320)
  }

  /** Pause the crackle when the tab is hidden — nobody wants a hissing tab. */
  setSuspended(suspended: boolean) {
    if (!this.ctx || !this.noiseBus) return
    const target = suspended || this.state.status === 'idle' ? 0.0001 : 0.6
    this.noiseBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.15)
  }
}

export const player = new PreviewPlayer()
