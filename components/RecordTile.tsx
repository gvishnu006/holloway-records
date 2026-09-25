'use client'

import Link from 'next/link'

import { SleeveReveal } from './SleeveReveal'
import type { RecordItem } from '@/lib/catalog'
import { cx, money } from '@/lib/format'
import { useCart } from '@/lib/store/cart'

/** The grid view. Used on the about page and in the crate browser's grid. */
type Props = {
  record: RecordItem
  className?: string
}

export function RecordTile({ record, className }: Props) {
  const { add, pulse } = useCart()
  const inPulse = pulse === record.slug

  return (
    <article className={cx('group/tile grain relative flex flex-col', className)}>
      <div className="relative">
        <SleeveReveal record={record} variant="tile" />
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="display-md text-lg leading-tight text-paper">
          <Link href={`/records/${record.slug}`} className="decoration-amber underline-offset-4 hover:underline">
            {record.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-paper-dim">{record.artist}</p>

        <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-paper-ghost">
          {record.year} · {record.catalogNumber}
        </p>

        <p className="mt-3 line-clamp-2 text-sm italic leading-relaxed text-paper-faint">
          {record.soundsLike}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3 pt-1">
          <span className="display-md text-lg text-paper">{money(record.price)}</span>
          <button
            type="button"
            onClick={() => add(record.slug)}
            className={cx('btn btn-sm', inPulse ? 'btn-amber' : 'btn-ghost')}
          >
            {inPulse ? 'In the bag' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}
