import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { RecordDetail } from '@/components/RecordDetail'
import { RECORDS, getRecord } from '@/lib/catalog'

/** Every record gets its own page, pre-rendered at build time. */
export function generateStaticParams() {
  return RECORDS.map((r) => ({ slug: r.slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const record = getRecord(slug)
  if (!record) return { title: 'Not on the shelf' }

  const title = `${record.artist} — ${record.title} (${record.year})`
  const description = `${record.soundsLike} ${record.label} ${record.catalogNumber}. ${record.condition.vinyl} vinyl, ${record.condition.sleeve} sleeve. £${(record.price / 100).toFixed(2)} from Holloway Records.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'music.album' },
  }
}

export default async function RecordPage({ params }: Params) {
  const { slug } = await params
  const record = getRecord(slug)
  if (!record) notFound()

  return (
    <>
      <Header />
      <main id="main">
        <RecordDetail record={record} />
      </main>
      <Footer />
    </>
  )
}
