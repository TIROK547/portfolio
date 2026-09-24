import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { guardApi } from '@/lib/auth'
import { UPLOAD_DIR, getDb } from '@/lib/db'

export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024

// Detect the real type from magic bytes; never trust the client's filename or MIME type.
function sniff(b: Uint8Array): 'png' | 'jpg' | 'gif' | 'webp' | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to))
  if (b.length > 8 && b[0] === 0x89 && ascii(1, 4) === 'PNG') return 'png'
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
  if (b.length > 6 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) return 'gif'
  if (b.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
  return null
}

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BYTES + 1024 * 64) {
    return NextResponse.json({ error: 'file too large (max 8 MB)' }, { status: 413 })
  }
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no file' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'file too large (max 8 MB)' }, { status: 413 })

  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = sniff(bytes)
  if (!ext) return NextResponse.json({ error: 'only png, jpg, gif and webp images are allowed' }, { status: 415 })

  getDb() // ensures the upload directory exists
  const name = `${randomUUID()}.${ext}`
  await fs.writeFile(path.join(UPLOAD_DIR, name), bytes)
  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 })
}
