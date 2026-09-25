'use client'

import { useMemo, useState } from 'react'

import { RecordRow } from './RecordRow'
import { RecordTile } from './RecordTile'
import { RECORDS, type RecordItem } from '@/lib/catalog'
import { cx, money } from '@/lib/format'

/**
 * The crate browser.
 *
 * Twelve records, so a filter panel is really a sorting and searching surface.
 * No pagination, no infinite scroll, no faceted nonsense — just the two things
 * you actually do in a shop: look for a name, and sort by a column.
 */

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'grade'

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'featured', label: 'Shelf order' },
  { key: 'newest', label: 'Newest in' },
  { key: 'oldest', label: 'Oldest in' },
  { key: 'price-asc', label: 'Cheapest' },
  { key: 'price-desc', label: 'Dearest' },
  { key: 'grade', label: 'Best condition' },
]

const GRADE_ORDER: Record<RecordItem['condition']['vinyl'], number> = {
  M: 6,
  NM: 5,
  'VG+': 4,
  VG: 3,
  'G+': 2,
  G: 1,
}

type View = 'list' | 'grid'

export function CrateBrowser({ records = RECORDS }: { records?: RecordItem[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('featured')
  const [view, setView] = useState<View>('list')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? records.filter((r) =>
          [r.artist, r.title, r.label, r.catalogNumber, r.genre, ...r.tags]
            .join(' ')
            .toLowerCase()
            .includes(q),
        )
      : records

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        sorted.sort((a, b) => b.added.localeCompare(a.added))
        break
      case 'oldest':
        sorted.sort((a, b) => a.added.localeCompare(b.added))
        break
      case 'grade':
        sorted.sort(
          (a, b) =>
            GRADE_ORDER[b.condition.vinyl] - GRADE_ORDER[a.condition.vinyl] || a.price - b.price,
        )
        break
      default:
        break
    }
    return sorted
  }, [records, query, sort])

  const total = results.reduce((n, r) => n + r.price, 0)

  return (
    <section aria-labelledby="crate-heading" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="flex flex-col gap-6 border-b border-paper/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="crate-heading" className="display-lg text-3xl text-paper sm:text-4xl">
            The crate
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-paper-dim">
            Twelve records, one copy each unless noted. Everything is in the sleeve drawer and
            plays through before it gets a price sticker.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="crate-search" className="runin shrink-0">
              Look for
            </label>
            <input
              id="crate-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Artist, label, PTM-4…"
              className="min-w-0 flex-1 border-b border-paper/20 bg-transparent pb-1.5 font-mono text-sm text-paper placeholder:text-paper-ghost focus:border-amber focus:outline-none sm:w-64 sm:flex-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="crate-sort" className="runin shrink-0">
              Sort
            </label>
            <select
              id="crate-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border-b border-paper/20 bg-transparent pb-1.5 font-mono text-sm text-paper focus:border-amber focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key} className="bg-void text-paper">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1" role="group" aria-label="View">
            {(['list', 'grid'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cx('btn btn-sm', view === v ? 'btn-ghost text-amber' : 'btn-ghost')}
              >
                {v === 'list' ? <ListIcon /> : <GridIcon />}
                <span className="sr-only">{v === 'list' ? 'List view' : 'Grid view'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count, announced politely so the search is not silent. */}
      <p aria-live="polite" className="runin mt-6">
        {results.length === records.length
          ? `${results.length} records · shelf total ${money(total)}`
          : `${results.length} of ${records.length} records · ${money(total)}`}
      </p>

      {results.length === 0 ? (
        <div className="mt-10 border border-dashed border-paper/15 px-6 py-16 text-center">
          <p className="display-md text-2xl text-paper">Nothing in the drawer matches that.</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-paper-dim">
            Try an artist, a label, or part of a catalogue number. We get new stock every Monday
            and Friday.
          </p>
          <button type="button" onClick={() => setQuery('')} className="btn btn-ghost btn-sm mt-6">
            Clear the search
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="mt-2">
          {results.map((record, i) => (
            <RecordRow key={record.slug} record={record} index={i} />
          ))}
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((record) => (
            <li key={record.slug}>
              <RecordTile record={record} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
