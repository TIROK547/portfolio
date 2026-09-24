import fs from 'node:fs/promises'
import path from 'node:path'
import { UPLOAD_DIR } from '@/lib/db'

export const runtime = 'nodejs'

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const m = /^[0-9a-f-]{36}\.(png|jpg|gif|webp)$/.exec(name)
  if (!m) return new Response('Not found', { status: 404 })
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name))
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': TYPES[m[1]],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
