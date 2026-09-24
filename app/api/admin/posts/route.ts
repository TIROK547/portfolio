import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { savePost, SlugTakenError } from '@/lib/db'
import { parsePostInput } from '@/lib/validate'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const parsed = parsePostInput(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  try {
    return NextResponse.json(savePost(parsed.value), { status: 201 })
  } catch (e) {
    if (e instanceof SlugTakenError) return NextResponse.json({ error: 'slug already in use' }, { status: 409 })
    throw e
  }
}
