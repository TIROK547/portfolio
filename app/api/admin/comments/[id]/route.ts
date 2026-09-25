import { NextRequest, NextResponse } from 'next/server'
import { guardApi, parseId } from '@/lib/auth'
import { deleteComment } from '@/lib/db'

export const runtime = 'nodejs'

// Deleting a comment also deletes the replies under it (ON DELETE CASCADE).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  if (id === null || !deleteComment(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
