import { NextRequest, NextResponse } from 'next/server'
import { guardApi, parseId } from '@/lib/auth'
import { deleteProject, saveProject } from '@/lib/db'
import { parseProjectInput } from '@/lib/validate'

export const runtime = 'nodejs'
type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  if (id === null) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const parsed = parseProjectInput(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const saved = saveProject(parsed.value, id)
  return saved ? NextResponse.json(saved) : NextResponse.json({ error: 'not found' }, { status: 404 })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await guardApi(req)
  if (denied) return denied
  const id = parseId((await params).id)
  if (id === null || !deleteProject(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
