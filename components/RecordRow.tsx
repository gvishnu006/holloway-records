'use client'

import Link from 'next/link'

import { SleeveReveal } from './SleeveReveal'
import type { RecordItem } from '@/lib/catalog'
import { cx, money } from '@/lib/format'
import { useCart } from '@/lib/store/cart'

/**
 * One line in the crate list.
 *
 * This is the shop's working view, not a card grid: everything a buyer wants
 * before committing is on one line — who, what, year, label, catalogue number,
 * what we paid, what we want. The record slides out of the sleeve on hover and
 * the disc settles over the listing, which is the only honest way to show a
 * turntable on a screen.
 */

type Props = {
  record: RecordItem
  index: number
}

export function RecordRow({ record, index }: Props) {
  const { add, pulse } = useCart()
  const inPulse = pulse === record.slug

  return (
    <article className="group/row relative border-b border-paper/8 last:border-b-0">
      <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:gap-7 sm:py-8">
        {/* Sleeve. Shrinks the artwork box on wide screens so the disc can
            overhang it without colliding with the text. */}
        <div className="relative w-24 shrink-0 sm:w-28">
          <SleeveReveal record={record} variant="row" side={index % 2 === 0 ? 'A' : 'B'} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="cat w-6 shrink-0 text-paper-ghost">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="display-md min-w-0 text-2xl leading-tight text-paper sm:text-[1.7rem]">
              <Link href={`/records/${record.slug}`} className="decoration-amber decoration-1 underline-offset-4 hover:underline">
                {record.title}
              </Link>
            </h3>
          </div>

          <p className="mt-1.5 pl-9 text-sm text-paper-dim">{record.artist}</p>

          <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-9 font-mono text-[0.6875rem] uppercase tracking-[0.12em]">
            <div className="flex gap-1.5">
              <dt className="text-paper-ghost">{record.year}</dt>
            </div>
            <div className="flex gap-1.5">
              <dt className="sr-only">Label</dt>
              <dd className="text-paper-faint">{record.label}</dd>
              <dt className="sr-only">Catalogue number</dt>
              <dd className="text-amber/70">{record.catalogNumber}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-paper-ghost">Pressed</dt>
              <dd className="text-paper-faint">{record.pressing}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="sr-only">Condition</dt>
              <dd className="text-paper-faint">
                <GradeDot grade={record.condition.vinyl} /> vinyl
                <span className="mx-1.5 text-paper-ghost">·</span>
                <GradeDot grade={record.condition.sleeve} /> sleeve
              </dd>
            </div>
          </dl>

          <p className="mt-4 max-w-prose pl-9 text-sm italic leading-relaxed text-paper-faint">
            {record.houseNote}
          </p>
        </div>

        {/* Price and the till. */}
        <div className="flex shrink-0 items-end justify-between gap-4 pl-9 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:gap-4 sm:pl-0">
          <div className="sm:text-right">
            <p className="display-md text-2xl text-paper">{money(record.price)}</p>
            {record.paid !== null && (
              <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-ghost">
                We paid {money(record.paid)}
              </p>
            )}
            <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper-ghost">
              {record.stock === 1 ? 'One copy' : `${record.stock} copies`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => add(record.slug)}
            className={cx('btn btn-sm whitespace-nowrap', inPulse ? 'btn-amber' : 'btn-ghost')}
          >
            {inPulse ? 'In the bag' : record.stock === 1 ? 'Take it' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}

/** Grades get a signal, not just a letter: mint, quiet amber, then rust. */
function GradeDot({ grade }: { grade: string }) {
  const tone =
    grade === 'M' || grade === 'NM'
      ? 'text-mint'
      : grade === 'VG+'
        ? 'text-amber'
        : grade === 'VG' || grade === 'G+'
          ? 'text-amber-deep'
          : 'text-rust'
  return <span className={cx('font-semibold', tone)}>{grade}</span>
}
