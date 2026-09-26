import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { reorderProjects } from '@/lib/db'
import { parseProjectOrder } from '@/lib/validate'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const parsed = parseProjectOrder(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  reorderProjects(parsed.value)
  return NextResponse.json({ ok: true })
}
