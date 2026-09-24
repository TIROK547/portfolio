import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './session'

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value)
}

/** For admin pages: bounce to the login page when there's no valid session. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect('/login')
}

/**
 * For admin API routes: returns an error response, or null when the request may proceed.
 * Mutating requests must also come from the same origin (CSRF defence on top of SameSite=Strict).
 */
export async function guardApi(req: NextRequest): Promise<NextResponse | null> {
  if (!(await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.get('origin')
    let ok = false
    try {
      ok = !!origin && new URL(origin).host === req.headers.get('host')
    } catch {}
    if (!ok) return NextResponse.json({ error: 'bad origin' }, { status: 403 })
  }
  return null
}

export function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null
}
