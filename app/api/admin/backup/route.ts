import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { snapshotDatabase } from '@/lib/backup'
import { UPLOAD_DIR } from '@/lib/db'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { ZipArchive } from 'archiver'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-backup-'))
  try {
    const snapshot = path.join(temp, 'site.db')
    snapshotDatabase(snapshot)
    // Stage uploads too: a concurrent restore cannot change files under the stream.
    const uploads = path.join(temp, 'uploads')
    fs.cpSync(UPLOAD_DIR, uploads, { recursive: true })
    const archive = new ZipArchive({ zlib: { level: 6 } })
    const cleanup = () => fs.rmSync(temp, { recursive: true, force: true })
    archive.once('close', cleanup)
    archive.once('error', cleanup)
    archive.file(snapshot, { name: 'site.db' })
    archive.directory(uploads, 'uploads')
    void archive.finalize().catch(error => archive.destroy(error))
    return new NextResponse(Readable.toWeb(archive) as ReadableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.zip"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    fs.rmSync(temp, { recursive: true, force: true })
    console.error('[backup]', error)
    return NextResponse.json({ error: 'Could not create backup' }, { status: 500 })
  }
}
