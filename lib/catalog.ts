/**
 * Holloway Records — the back room.
 *
 * Twelve records that came out of the crates this month. Everything a customer
 * would ask at the counter is on the object: the pressing, the runout, the
 * grade, what we paid for it, and one unvarnished sentence from whoever dug it
 * out. No adjectives nobody means.
 *
 * Prices are in pence. Grades follow the usual Goldmine letters, minus the
 * "still sealed" nonsense — everything here has been played at least once,
 * because that is what second-hand means.
 */

/* ── Grades ─────────────────────────────────────────────────────────────── */

export const GRADES = ['M', 'NM', 'VG+', 'VG', 'G+', 'G'] as const
export type Grade = (typeof GRADES)[number]

export const GRADE_NOTE: Record<Grade, string> = {
  M: 'Unplayed. We would not know.',
  NM: 'Near mint. Looks handled, plays like new.',
  'VG+': 'Light marks. No crackle you would notice.',
  VG: 'Honest wear. Audible on quiet passages.',
  'G+': 'Plays through. Sleeve has been through something.',
  G: 'For the shelf, not the needle.',
}

/* ── Cover art ──────────────────────────────────────────────────────────── */

/** Each record has its own art direction — these are the twelve we drew. */
export type CoverMotif =
  | 'sunburst'
  | 'offset'
  | 'ledger'
  | 'torn'
  | 'hairline'
  | 'eclipse'
  | 'thirds'
  | 'strata'
  | 'chevron'
  | 'barbwire'
  | 'halftone'
  | 'cone'

export type Cover = {
  motif: CoverMotif
  /** Paper stock the sleeve is printed on. */
  ground: string
  /** The ink. Usually one, occasionally two. */
  ink: string
  /** Anything in a third colour — a label logo, a misprint, a price sticker. */
  accent: string
  /** Sits the motif off-centre so the grid never looks stamped. */
  seed: number
}

export type Track = { n: string; title: string; time: string; side: 'A' | 'B' }

/** Everything the preview sequencer needs to write fifteen seconds of music. */
export type Preview = {
  /** Anything stable — it seeds the noise generator for the crackle. */
  seed: number
  bpm: number
  /** Root note as a semitone offset from A1. */
  root: number
  scale: 'minor' | 'dorian' | 'mixolydian' | 'majorPent' | 'lydian' | 'phrygian'
  /** Chord degrees per bar, as offsets inside the scale. */
  progression: number[][]
  drums: 'four' | 'breakbeat' | 'brush' | 'halftime' | 'none'
  voice: 'brass' | 'keys' | 'pluck' | 'organ' | 'marimba' | 'strings' | 'reed'
  /** 0 = straight. 0.16 is a lazy shuffle. */
  swing: number
}

export type RecordItem = {
  slug: string
  artist: string
  title: string
  year: number
  label: string
  catalogNumber: string
  pressing: string
  runout: string
  rpm: 33 | 45
  genre: string
  tags: string[]
  condition: { vinyl: Grade; sleeve: Grade }
  /** What we want for it. */
  price: number
  /** What we gave for it, or null if it came in on a trade. */
  paid: number | null
  stock: number
  added: string
  cover: Cover
  tracks: Track[]
  preview: Preview
  /** Whoever pulled this out of the crate writes three lines. This is theirs. */
  houseNote: string
  /** One line for the shelf label. */
  soundsLike: string
  featured?: boolean
}

export const RECORDS: RecordItem[] = [
  {
    slug: 'reyes-cumbias-del-puerto',
    artist: 'Ishmael Reyes y la Orquesta del Puerto',
    title: 'Cumbías del Puerto',
    year: 1974,
    label: 'Discos Tlalpan',
    catalogNumber: 'DTLP-1042',
    pressing: 'Second pressing, laminated flipback',
    runout: 'DTLP-1042-B △ Plastic pyramids',
    rpm: 33,
    genre: 'Cumbia',
    tags: ['colombia', 'dancefloor', 'latin'],
    condition: { vinyl: 'VG+', sleeve: 'VG+' },
    price: 3400,
    paid: 900,
    stock: 1,
    added: '2026-09-04',
    cover: { motif: 'sunburst', ground: '#1a1410', ink: '#e8b552', accent: '#c04a2a', seed: 3 },
    tracks: [
      { n: 'A1', title: 'Cumbia del Puerto', time: '2:41', side: 'A' },
      { n: 'A2', title: 'La Chiva', time: '2:19', side: 'A' },
      { n: 'A3', title: 'Amapola', time: '2:52', side: 'A' },
      { n: 'A4', title: 'No Me Hagás Reír', time: '2:07', side: 'A' },
      { n: 'B1', title: 'El Francés', time: '2:33', side: 'B' },
      { n: 'B2', title: 'Rumor de Lluvia', time: '2:24', side: 'B' },
      { n: 'B3', title: 'Son del Barco', time: '2:58', side: 'B' },
    ],
    preview: {
      seed: 1042,
      bpm: 96,
      root: 3,
      scale: 'dorian',
      progression: [
        [0, 2, 4],
        [5, 0, 2],
        [3, 5, 0],
        [4, 6, 1],
      ],
      drums: 'four',
      voice: 'brass',
      swing: 0.14,
    },
    houseNote:
      'Sounded like a knife in a drawerseat once we got it on the test deck — bright, close, and the bass player absolutely refuses to lay back. Copy came from a house clearance outside Puebla, still in the original inner. Sleeve has a price sticker ghost on the back, which we left on.',
    soundsLike: 'Three sets of brass arguing over one accordion.',
    featured: true,
  },
  {
    slug: 'blue-meridian-quintet-oblique',
    artist: 'Blue Meridian Quintet',
    title: 'Oblique Themes',
    year: 1968,
    label: 'Bellhouse',
    catalogNumber: 'BH-2207',
    pressing: 'Mono first pressing, deep groove',
    runout: 'BH-2207-A-1 ▽ Deep groove, dead centre',
    rpm: 33,
    genre: 'Modal jazz',
    tags: ['hard bop', 'mono', 'piano'],
    condition: { vinyl: 'VG+', sleeve: 'VG' },
    price: 5200,
    paid: 2200,
    stock: 1,
    added: '2026-08-21',
    cover: { motif: 'offset', ground: '#12100e', ink: '#ddd0bb', accent: '#e0a63c', seed: 7 },
    tracks: [
      { n: 'A1', title: 'Oblique Themes', time: '8:12', side: 'A' },
      { n: 'A2', title: 'Cue for Ruth', time: '6:44', side: 'A' },
      { n: 'A3', title: 'Nightingale', time: '7:03', side: 'A' },
      { n: 'B1', title: 'The Long Way Round', time: '9:28', side: 'B' },
      { n: 'B2', title: "Don't Explain It", time: '5:51', side: 'B' },
    ],
    preview: {
      seed: 2207,
      bpm: 84,
      root: 2,
      scale: 'dorian',
      progression: [
        [0, 2, 4, 6],
        [0, 2, 4, 6],
        [5, 0, 2, 4],
        [3, 5, 0, 2],
      ],
      drums: 'brush',
      voice: 'keys',
      swing: 0.1,
    },
    houseNote:
      'Bellhouse folded in 1971 and pressed the whole back half mono, which is why you can hear the room. Pianist recorded it in one afternoon and it shows — nothing wasted. Our mono side has the faintest vertical scratch near the runout, silent until the last track.',
    soundsLike: 'Piano left alone in a room with good acoustics.',
    featured: true,
  },
  {
    slug: 'kessel-vantwood-tape-loss',
    artist: 'Kessel & Vantwood',
    title: 'Tape Loss, Vol. 2',
    year: 1983,
    label: 'Vantone',
    catalogNumber: 'VNT-0442',
    pressing: 'Original, white label promo',
    runout: 'VNT-0442 [PROMO] Hand-stamped B',
    rpm: 45,
    genre: 'Electronic / library',
    tags: ['synth', 'production', 'sample fodder'],
    condition: { vinyl: 'NM', sleeve: 'NM' },
    price: 1800,
    paid: 400,
    stock: 2,
    added: '2026-09-11',
    cover: { motif: 'ledger', ground: '#0f0e0d', ink: '#9aa7b4', accent: '#e0a63c', seed: 1 },
    tracks: [
      { n: 'A1', title: 'Tape Loss', time: '2:58', side: 'A' },
      { n: 'A2', title: 'Cassette Ghost', time: '3:12', side: 'A' },
      { n: 'A3', title: 'Interference Pattern', time: '2:44', side: 'A' },
      { n: 'B1', title: 'Dropout (Edit)', time: '3:30', side: 'B' },
      { n: 'B2', title: 'Bias Test', time: '2:21', side: 'B' },
    ],
    preview: {
      seed: 442,
      bpm: 118,
      root: 0,
      scale: 'minor',
      progression: [
        [0, 2, 4],
        [0, 2, 4],
        [5, 0, 2],
        [4, 6, 1],
      ],
      drums: 'breakbeat',
      voice: 'pluck',
      swing: 0,
    },
    houseNote:
      'Promo copy, hand-stamped, never sold commercially. Two people have already asked after the B-side edit alone. It is not dance music; it is a drum machine being slowly destroyed in a room with a broken lift.',
    soundsLike: 'Drum machine falling down a stairwell, in time.',
  },
  {
    slug: 'draymoor-set-concrete-sunday',
    artist: 'The Draymoor Set',
    title: 'Concrete Sunday',
    year: 1979,
    label: 'Draymoor',
    catalogNumber: 'DRM-002',
    pressing: 'Private press, 500 copies',
    runout: 'Hand-etched Draymoor, no number',
    rpm: 33,
    genre: 'Post-punk',
    tags: ['private press', 'drum machine', 'nocturnal'],
    condition: { vinyl: 'VG+', sleeve: 'G+' },
    price: 4400,
    paid: 1500,
    stock: 1,
    added: '2026-08-30',
    cover: { motif: 'torn', ground: '#141312', ink: '#c9c2b4', accent: '#a8503a', seed: 5 },
    tracks: [
      { n: 'A1', title: 'Concrete Sunday', time: '3:47', side: 'A' },
      { n: 'A2', title: 'Bus Depot', time: '2:58', side: 'A' },
      { n: 'A3', title: 'Quiet Street', time: '4:12', side: 'A' },
      { n: 'A4', title: 'Everyone Agreed', time: '3:21', side: 'A' },
      { n: 'B1', title: 'Frost on the Windscreen', time: '5:02', side: 'B' },
      { n: 'B2', title: 'Six Weeks', time: '3:33', side: 'B' },
    ],
    preview: {
      seed: 2,
      bpm: 132,
      root: 5,
      scale: 'phrygian',
      progression: [
        [0, 2, 4],
        [1, 3, 5],
        [0, 2, 4],
        [4, 5, 1],
      ],
      drums: 'four',
      voice: 'reed',
      swing: 0,
    },
    houseNote:
      'Self-released on the drummer’s inheritance, pressed at a plant in Wolverhampton that has long since shut. Played it to three people this month and all three asked where to buy it, which is the only review that has ever mattered to us. Sleeve is water-marked at the bottom left; we say so on the label and the price reflects it.',
    soundsLike: 'Four people in a cold room refusing to play it quiet.',
    featured: true,
  },
  {
    slug: 'anouk-delacroix-chambre-froide',
    artist: 'Anouk Delacroix',
    title: 'Chambre Froide',
    year: 1977,
    label: 'Solaris',
    catalogNumber: 'SOL-118',
    pressing: 'First pressing, textured sleeve',
    runout: 'SOL-118-A ★ Solaris, Paris',
    rpm: 33,
    genre: 'Minimal wave',
    tags: ['france', 'synth', 'cold'],
    condition: { vinyl: 'VG+', sleeve: 'NM' },
    price: 3900,
    paid: 1200,
    stock: 1,
    added: '2026-09-01',
    cover: { motif: 'hairline', ground: '#0c0e11', ink: '#dfe6ee', accent: '#e0a63c', seed: 2 },
    tracks: [
      { n: 'A1', title: 'Chambre Froide', time: '4:22', side: 'A' },
      { n: 'A2', title: 'Vitres', time: '3:51', side: 'A' },
      { n: 'A3', title: 'Sans Nom', time: '5:04', side: 'A' },
      { n: 'B1', title: 'Sept Heures', time: '3:38', side: 'B' },
      { n: 'B2', title: 'Réveil', time: '6:17', side: 'B' },
      { n: 'B3', title: 'Retour', time: '2:47', side: 'B' },
    ],
    preview: {
      seed: 118,
      bpm: 108,
      root: 4,
      scale: 'majorPent',
      progression: [
        [0, 2, 4],
        [3, 5, 0],
        [0, 2, 4],
        [4, 6, 2],
      ],
      drums: 'halftime',
      voice: 'keys',
      swing: 0,
    },
    houseNote:
      'Recorded in one room in Montreuil in eleven days. Delacroix played everything herself and insisted in the liner that the hum you can hear under track four is a fault. It is not a fault. It is the best part of the record.',
    soundsLike: 'One woman, one synth, one very cold room.',
  },
  {
    slug: 'astral-broadcast-nightwatch',
    artist: 'Astral Broadcast Corp.',
    title: 'Nightwatch, Vol. 3',
    year: 1975,
    label: 'Nightwatch',
    catalogNumber: 'NW-3300',
    pressing: 'Third pressing, gatefold',
    runout: 'NW-3300-B ✦ Astral, Chicago',
    rpm: 33,
    genre: 'Spiritual jazz',
    tags: ['chicago', 'afrofuturism', 'ensemble'],
    condition: { vinyl: 'VG+', sleeve: 'VG+' },
    price: 5800,
    paid: 2600,
    stock: 1,
    added: '2026-08-14',
    cover: { motif: 'eclipse', ground: '#0d0b14', ink: '#c3b6e0', accent: '#e0a63c', seed: 9 },
    tracks: [
      { n: 'A1', title: 'Nightwatch, Pt. 1', time: '11:48', side: 'A' },
      { n: 'A2', title: 'Nightwatch, Pt. 2', time: '9:22', side: 'A' },
      { n: 'B1', title: 'Morning Star', time: '12:36', side: 'B' },
      { n: 'B2', title: 'The Signal', time: '8:04', side: 'B' },
    ],
    preview: {
      seed: 3300,
      bpm: 92,
      root: 1,
      scale: 'dorian',
      progression: [
        [0, 2, 4, 6],
        [3, 5, 0, 2],
        [4, 6, 1, 3],
        [0, 2, 4, 6],
      ],
      drums: 'brush',
      voice: 'reed',
      swing: 0.18,
    },
    houseNote:
      'Eleven musicians, two horn players who were not paid on the first day, and a leader who ran the band like a union meeting. Four sides that never repeat. If you only buy one long record this month, make it this one.',
    soundsLike: 'A brass section arguing with the drummer, and winning.',
    featured: true,
  },
  {
    slug: 'kertesz-trio-window-seat',
    artist: 'Béla Kertész Trio',
    title: 'Window Seat',
    year: 1991,
    label: 'Arc',
    catalogNumber: 'ARC-0712',
    pressing: 'CD era vinyl, made in England',
    runout: 'ARC-0712 [UK] Made in England',
    rpm: 33,
    genre: 'Post-bop',
    tags: ['hungary', 'piano trio', 'late period'],
    condition: { vinyl: 'NM', sleeve: 'NM' },
    price: 2900,
    paid: 800,
    stock: 2,
    added: '2026-09-08',
    cover: { motif: 'thirds', ground: '#121014', ink: '#cfc6d4', accent: '#e0a63c', seed: 4 },
    tracks: [
      { n: 'A1', title: 'Window Seat', time: '6:52', side: 'A' },
      { n: 'A2', title: 'Blue Hour', time: '5:41', side: 'A' },
      { n: 'A3', title: 'Platform 4', time: '7:18', side: 'A' },
      { n: 'B1', title: 'On the Way Back', time: '6:05', side: 'B' },
      { n: 'B2', title: 'Late', time: '4:58', side: 'B' },
    ],
    preview: {
      seed: 712,
      bpm: 76,
      root: 3,
      scale: 'lydian',
      progression: [
        [0, 2, 4],
        [1, 3, 5],
        [4, 6, 1],
        [0, 2, 4],
      ],
      drums: 'brush',
      voice: 'marimba',
      swing: 0.12,
    },
    houseNote:
      'The last thing Kertész recorded with a drummer who talked to him. Bass player wrote the middle of side A in the taxi on the way to the session. Nearly mint, and honestly we cannot work out why it is here.',
    soundsLike: 'Three people listening very carefully to each other.',
  },
  {
    slug: 'oyelaran-field-notes-harbour',
    artist: 'Marguerite Oyelaran',
    title: 'Field Notes: Harbour',
    year: 1988,
    label: 'Meridian Editions',
    catalogNumber: 'ME-009',
    pressing: 'Edition of 300, hand-numbered',
    runout: 'Numbered 147/300, etched by hand',
    rpm: 33,
    genre: 'Field recordings',
    tags: ['documentary', 'harbour', 'ambient'],
    condition: { vinyl: 'NM', sleeve: 'VG+' },
    price: 2200,
    paid: 700,
    stock: 3,
    added: '2026-09-12',
    cover: { motif: 'strata', ground: '#0c1010', ink: '#a8c0c0', accent: '#e0a63c', seed: 6 },
    tracks: [
      { n: 'A1', title: 'Six Bells, No Wind', time: '7:30', side: 'A' },
      { n: 'A2', title: 'Container Yard', time: '5:12', side: 'A' },
      { n: 'A3', title: 'Gulls, Second Evening', time: '8:44', side: 'A' },
      { n: 'B1', title: 'Dredger', time: '9:01', side: 'B' },
      { n: 'B2', title: 'Fog Signal', time: '6:55', side: 'B' },
    ],
    preview: {
      seed: 9,
      bpm: 60,
      root: 6,
      scale: 'majorPent',
      progression: [
        [0, 2, 4],
        [0, 2, 4],
        [3, 5, 0],
        [4, 6, 2],
      ],
      drums: 'none',
      voice: 'strings',
      swing: 0,
    },
    houseNote:
      'Oyelaran spent nine months in an industrial harbour recording nothing but ambient noise, then added a single sustained cello note to each side. Number 147 of 300, and the pencil is still legible on the runout. Do not play it loudly. That is the whole instruction.',
    soundsLike: 'A harbour at 4am, with someone quietly holding a note.',
  },
  {
    slug: 'hijos-del-muelle-puerto-nuevo',
    artist: 'Los Hijos del Muelle',
    title: 'Puerto Nuevo',
    year: 1982,
    label: 'Sonora Latina',
    catalogNumber: 'SL-4410',
    pressing: 'Mexican pressing, gatefold',
    runout: 'SL-4410-B ⊕ Sonora, México',
    rpm: 33,
    genre: 'Latin',
    tags: ['mexico', 'guitar', 'warm'],
    condition: { vinyl: 'VG+', sleeve: 'VG+' },
    price: 2700,
    paid: 600,
    stock: 1,
    added: '2026-09-05',
    cover: { motif: 'chevron', ground: '#141210', ink: '#e6c98a', accent: '#a8503a', seed: 8 },
    tracks: [
      { n: 'A1', title: 'Puerto Nuevo', time: '3:34', side: 'A' },
      { n: 'A2', title: 'Muelle Siete', time: '3:12', side: 'A' },
      { n: 'A3', title: 'Carta de Nicolás', time: '4:01', side: 'A' },
      { n: 'A4', title: 'Volver', time: '3:22', side: 'A' },
      { n: 'B1', title: 'Salinera', time: '4:18', side: 'B' },
      { n: 'B2', title: 'Desde el Faro', time: '3:49', side: 'B' },
    ],
    preview: {
      seed: 4410,
      bpm: 104,
      root: 2,
      scale: 'mixolydian',
      progression: [
        [0, 2, 4],
        [5, 0, 2],
        [0, 2, 4],
        [3, 5, 0],
      ],
      drums: 'four',
      voice: 'pluck',
      swing: 0.15,
    },
    houseNote:
      'Bought as a pair with the Tlalpan cumbia; the two have been on the turntable together all month. Two brothers on guitars and a drummer who plays behind the beat on purpose. Nothing clever. Nothing needed.',
    soundsLike: 'Two brothers, three chords, and a drummer who means it.',
  },
  {
    slug: 'ferrier-barbed-wire',
    artist: 'Roy Ferrier',
    title: 'Twelve Barbed Wire Blues',
    year: 1971,
    label: 'Rambler',
    catalogNumber: 'RBL-2210',
    pressing: 'First pressing, plain white sleeve',
    runout: 'RBL-2210 Rambler, Memphis',
    rpm: 33,
    genre: 'Country blues',
    tags: ['solo guitar', 'field recording', 'documentary'],
    condition: { vinyl: 'VG', sleeve: 'G+' },
    price: 4800,
    paid: 3100,
    stock: 1,
    added: '2026-08-07',
    cover: { motif: 'barbwire', ground: '#161311', ink: '#cfc4b2', accent: '#a8503a', seed: 10 },
    tracks: [
      { n: 'A1', title: 'Twelve Barbed Wire Blues', time: '4:18', side: 'A' },
      { n: 'A2', title: 'Delta Morning', time: '3:42', side: 'A' },
      { n: 'A3', title: 'Hollowbone', time: '5:26', side: 'A' },
      { n: 'A4', title: 'Two Rivers', time: '4:02', side: 'A' },
      { n: 'B1', title: 'Wire in the Well', time: '6:11', side: 'B' },
      { n: 'B2', title: 'Last One Before Noon', time: '5:04', side: 'B' },
    ],
    preview: {
      seed: 2210,
      bpm: 68,
      root: 4,
      scale: 'mixolydian',
      progression: [
        [0, 2, 4],
        [0, 2, 4],
        [0, 2, 4],
        [5, 0, 2],
      ],
      drums: 'none',
      voice: 'pluck',
      swing: 0.2,
    },
    houseNote:
      'Ferrier recorded this himself on a single stereo mic in a barn, alone, over one afternoon. The sleeve is a photocopy of a fence. There is a click at the start of side B that is the mic stand being knocked, and we have decided to leave it in. He died in 1994 and there is no other pressing of this at all.',
    soundsLike: 'One man, one guitar, one barn, one very long afternoon.',
  },
  {
    slug: 'neon-ossuary-terminal-3',
    artist: 'Neon Ossuary',
    title: 'Terminal 3',
    year: 1985,
    label: 'Ossuary',
    catalogNumber: 'OSS-003',
    pressing: 'Industrial issue, thick vinyl',
    runout: 'OSS-003 ⌘ Ossuary, cut at 3am',
    rpm: 45,
    genre: 'Industrial',
    tags: ['noise', 'tape', 'transit'],
    condition: { vinyl: 'VG+', sleeve: 'VG' },
    price: 2100,
    paid: 500,
    stock: 1,
    added: '2026-09-10',
    cover: { motif: 'halftone', ground: '#0e0d0d', ink: '#b8b2ab', accent: '#e0a63c', seed: 11 },
    tracks: [
      { n: 'A1', title: 'Terminal 3', time: '3:09', side: 'A' },
      { n: 'A2', title: 'Last Departure Board', time: '2:38', side: 'A' },
      { n: 'A3', title: 'Fluorescent', time: '4:44', side: 'A' },
      { n: 'B1', title: 'Nothing Scheduled', time: '3:27', side: 'B' },
      { n: 'B2', title: 'Taxi Rank', time: '5:53', side: 'B' },
    ],
    preview: {
      seed: 3,
      bpm: 140,
      root: 1,
      scale: 'phrygian',
      progression: [
        [0, 1, 3],
        [0, 1, 3],
        [1, 2, 4],
        [0, 1, 3],
      ],
      drums: 'breakbeat',
      voice: 'organ',
      swing: 0,
    },
    houseNote:
      'Not a band — two tape operators and a shipping manifest. The whole record is the sound of a transit hall being recorded illegally and then fed back until it became music. Played side B in the shop last week and three people stopped what they were doing.',
    soundsLike: 'A transit hall at 3am, fed back until it became music.',
  },
  {
    slug: 'ptarmigan-lift-music',
    artist: 'Ptarmigan Sound System',
    title: 'Lift Music Vol. 4',
    year: 1996,
    label: 'Ptarmigan',
    catalogNumber: 'PTM-4',
    pressing: '12-inch single, one-sided dub',
    runout: 'PTM-4 [DUB] Rhombus, Kingston',
    rpm: 45,
    genre: 'Sound system / dub',
    tags: ['dub', 'dubplate', 'chorus'],
    condition: { vinyl: 'NM', sleeve: 'G+' },
    price: 5600,
    paid: 1400,
    stock: 1,
    added: '2026-08-25',
    cover: { motif: 'cone', ground: '#0c0c0a', ink: '#d8c98a', accent: '#6f9c7a', seed: 12 },
    tracks: [
      { n: 'A1', title: 'Lift Music (Dub)', time: '6:12', side: 'A' },
      { n: 'A2', title: 'Lift Music (Version)', time: '5:48', side: 'A' },
      { n: 'A3', title: 'Lift Music (Steppers Cut)', time: '6:03', side: 'A' },
    ],
    preview: {
      seed: 4,
      bpm: 128,
      root: 0,
      scale: 'minor',
      progression: [
        [0, 2, 4],
        [3, 5, 0],
        [5, 0, 2],
        [4, 6, 1],
      ],
      drums: 'halftime',
      voice: 'organ',
      swing: 0,
    },
    houseNote:
      'A one-sided dubplate pressed for a sound system in 1996 and never sent home. The bass on the Steppers Cut is the reason we have a shop; we have had three people try to buy this from us in the last fortnight and had to move it behind the counter. Sleeve is a hand-cut card with a speaker cone inked on it — battered, and priced accordingly.',
    soundsLike: 'Bass you feel in the cupboard where you keep the glasses.',
    featured: true,
  },
]

/* ── Lookups ────────────────────────────────────────────────────────────── */

const BY_SLUG = new Map(RECORDS.map((r) => [r.slug, r]))

export function getRecord(slug: string): RecordItem | undefined {
  return BY_SLUG.get(slug)
}

export function getFeatured(): RecordItem[] {
  return RECORDS.filter((r) => r.featured)
}

/** The most recent arrival, for the "just in" line at the top of the shop. */
export function getNewest(): RecordItem | undefined {
  return RECORDS.reduce<RecordItem | undefined>((a, r) => (!a || r.added > a.added ? r : a), undefined)
}

export function getRelated(record: RecordItem, limit = 3): RecordItem[] {
  const scored = RECORDS.filter((r) => r.slug !== record.slug).map((r) => {
    let score = 0
    if (r.genre === record.genre) score += 3
    score += r.tags.filter((t) => record.tags.includes(t)).length
    if (r.rpm === record.rpm) score += 1
    if (Math.abs(r.year - record.year) <= 3) score += 1
    return { r, score }
  })
  return scored
    .sort((a, b) => b.score - a.score || a.r.year - b.r.year)
    .slice(0, limit)
    .map((x) => x.r)
}

export const GENRES: string[] = [...new Set(RECORDS.map((r) => r.genre))].sort()

export const SHOP = {
  name: 'Holloway Records',
  tagline: 'Second-hand vinyl, graded by ear',
  street: '41 Holloway Street',
  city: 'Bristol BS1 4QT',
  phone: '0117 496 0141',
  email: 'counter@hollowayrecords.example',
  est: 2009,
  hours: [
    { day: 'Tuesday', open: '10:00', close: '17:30' },
    { day: 'Wednesday', open: '10:00', close: '17:30' },
    { day: 'Thursday', open: '10:00', close: '19:00' },
    { day: 'Friday', open: '10:00', close: '17:30' },
    { day: 'Saturday', open: '09:30', close: '17:00' },
  ],
  shippingNote: 'Records posted Tuesday to Friday, Royal Mail 48h, £3.50 or free over £75.',
} as const

export type Shop = typeof SHOP
