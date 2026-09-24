import { NextRequest, NextResponse } from 'next/server'
import { guardApi, parseId } from '@/lib/auth'
import { deletePost, getPostById, savePost, SlugTakenError } from '@/lib/db'
import { parsePostInput } from '@/lib/validate'

export const runtime = 'nodejs'
type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  const post = id === null ? null : getPostById(id)
  return post ? NextResponse.json(post) : NextResponse.json({ error: 'not found' }, { status: 404 })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  if (id === null || !getPostById(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const parsed = parsePostInput(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  try {
    return NextResponse.json(savePost(parsed.value, id))
  } catch (e) {
    if (e instanceof SlugTakenError) return NextResponse.json({ error: 'slug already in use' }, { status: 409 })
    throw e
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  if (id === null || !deletePost(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
