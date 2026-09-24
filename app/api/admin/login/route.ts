import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_S } from '@/lib/session'
import { clearLoginFailures, loginBlocked, recordLoginFailure } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  try {
    if (!origin || new URL(origin).host !== req.headers.get('host')) throw new Error()
  } catch {
    return NextResponse.json({ error: 'bad origin' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (loginBlocked(ip)) {
    return NextResponse.json({ error: 'too many attempts, try again in 15 minutes' }, { status: 429 })
  }

  const body = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown } | null
  const username = typeof body?.username === 'string' ? body.username : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  // Evaluate both checks so timing doesn't reveal which one failed.
  const userOk = username === (process.env.ADMIN_USER ?? '') && username !== ''
  const passOk = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
  if (!userOk || !passOk) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  clearLoginFailures(ip)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  })
  return res
}
