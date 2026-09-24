import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { SESSION_COOKIE } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
