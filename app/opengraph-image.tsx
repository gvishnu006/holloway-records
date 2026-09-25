import { ImageResponse } from 'next/og'

import { SHOP } from '@/lib/catalog'

export const alt = 'Holloway Records — second-hand vinyl, graded by ear'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The shop card.
 *
 * Drawn with the same rules as the site: matte black, one amber, paper type. A
 * record coming out of its sleeve, because that is the picture this shop is.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#080706',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* The one warm lamp. */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            left: 380,
            width: 900,
            height: 640,
            background: 'radial-gradient(ellipse at center, rgba(224,166,60,0.20) 0%, rgba(8,7,6,0) 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              color: '#ece5d8',
              letterSpacing: '-0.03em',
              display: 'flex',
              fontFamily: 'serif',
            }}
          >
            Holloway
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#e0a63c',
              letterSpacing: '0.22em',
              display: 'flex',
              fontFamily: 'monospace',
            }}
          >
            RECORDS
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
            <div
              style={{
                fontSize: 58,
                lineHeight: 1.06,
                color: '#ece5d8',
                letterSpacing: '-0.02em',
                display: 'flex',
                fontFamily: 'serif',
              }}
            >
              Second-hand vinyl, graded by ear.
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 22,
                color: '#b9b0a0',
                display: 'flex',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
              }}
            >
              {SHOP.street} · {SHOP.city} · posted Tue–Fri
            </div>
          </div>

          {/* Sleeve with a record sliding out of it. */}
          <div style={{ display: 'flex', position: 'relative', width: 330, height: 330 }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 300,
                height: 300,
                background: '#100e0c',
                border: '1px solid rgba(236,229,216,0.10)',
                display: 'flex',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 118,
                top: 6,
                width: 300,
                height: 300,
                borderRadius: 999,
                background: 'radial-gradient(circle at 50% 50%, #0c0b0a 0%, #060505 100%)',
                border: '1px solid rgba(236,229,216,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 999,
                  background: '#e0a63c',
                  opacity: 0.92,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: '#080706',
                  display: 'flex',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
