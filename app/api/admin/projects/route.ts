import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { saveProject } from '@/lib/db'
import { parseProjectInput } from '@/lib/validate'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const parsed = parseProjectInput(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  return NextResponse.json(saveProject(parsed.value), { status: 201 })
}
