import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPostBySlug } from '@/lib/db'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

type Params = Promise<{ lang: string; slug: string }>

const decode = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params
  const post = getPostBySlug(decode(slug))

  // Load background template and font in parallel
  const [templateBuffer, fontBuffer] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'og-default.jpg')),
    readFile(path.join(process.cwd(), 'app', 'fonts', 'PressStart2P.woff')),
  ])

  const templateBase64 = `data:image/png;base64,${templateBuffer.toString('base64')}`
  const fontData: ArrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  ) as ArrayBuffer

  const title = post?.title ?? 'tirok blog'
  const category = post?.category?.name ?? null
  const readingTime = post?.readingMinutes ?? null

  const displayTitle = title.length > 80 ? title.slice(0, 77) + '...' : title

  const fontSize =
    displayTitle.length > 60 ? 32 :
    displayTitle.length > 40 ? 38 :
    displayTitle.length > 25 ? 44 : 50

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          fontFamily: '"PressStart2P"',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={templateBase64}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '1200px', height: '630px', objectFit: 'cover' }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <span style={{ color: '#4ade80', fontSize: '28px', lineHeight: 1 }}>&gt;</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '20px', letterSpacing: '0.05em' }}>
              ~/blog/
            </span>
          </div>

          <div
            style={{
              color: '#ffffff',
              fontSize: `${fontSize}px`,
              lineHeight: 1.5,
              maxWidth: '1000px',
              wordBreak: 'break-word',
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '72px',
              right: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {category && (
                <span
                  style={{
                    color: '#22d3ee',
                    fontSize: '16px',
                    background: 'rgba(34,211,238,0.12)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    padding: '6px 14px',
                  }}
                >
                  [{category}]
                </span>
              )}
              {readingTime && (
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
                  {readingTime} min read
                </span>
              )}
            </div>
            <span style={{ color: '#4ade80', fontSize: '16px', opacity: 0.8 }}>tirok_</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'PressStart2P', data: fontData, style: 'normal', weight: 400 }],
    }
  )
}
