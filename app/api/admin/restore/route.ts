import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { MAX_BACKUP_BYTES, restoreBackup } from '@/lib/backup'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  if (Number(req.headers.get('content-length')) > MAX_BACKUP_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'Backup too large (max 500 MB)' }, { status: 413 })
  }
  try {
    const form = await req.formData()
    const file = form.get('backup')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Select a backup ZIP' }, { status: 400 })
    if (file.size > MAX_BACKUP_BYTES) return NextResponse.json({ error: 'Backup too large (max 500 MB)' }, { status: 413 })
    restoreBackup(Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ ok: true, message: 'Restore complete. Reload to see restored content.' })
  } catch (error) {
    console.error('[restore]', error)
    return NextResponse.json({ error: 'Restore failed. Use a valid portfolio backup ZIP within the size limits. Existing data was retained.' }, { status: 400 })
  }
}
