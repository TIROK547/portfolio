import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { addComment, getComment, getSettings } from '@/lib/db'

export const runtime = 'nodejs'

/** Reply to a comment as the site owner. */
export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const b = (await req.json().catch(() => null)) as { parentId?: unknown; body?: unknown } | null
  const body = typeof b?.body === 'string' ? b.body.trim() : ''
  if (!body || body.length > 2000) {
    return NextResponse.json({ error: 'reply must be 1-2000 characters' }, { status: 400 })
  }
  const parent = Number.isInteger(b?.parentId) ? getComment(b!.parentId as number) : null
  if (!parent) return NextResponse.json({ error: 'comment not found' }, { status: 404 })

  const reply = addComment({
    postId: parent.postId,
    parentId: parent.id,
    author: getSettings().profile.alias,
    body,
    isAdmin: true,
  })
  return NextResponse.json(reply, { status: 201 })
}
