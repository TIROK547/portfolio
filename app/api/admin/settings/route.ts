import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { getSettings, saveSettings } from '@/lib/db'
import { parseSettingsInput } from '@/lib/validate'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  return NextResponse.json(getSettings())
}

export async function PUT(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const parsed = parseSettingsInput(await req.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  return NextResponse.json(saveSettings(parsed.value))
}
