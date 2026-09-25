import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

/**
 * One app, two hosts:
 *  - portfolio.tirok.ir -> public site; /admin and /api/admin are 404 here.
 *  - admin.tirok.ir     -> private editor; only the paths below exist, and everything but /login
 *                          needs a valid session. (The host -> /admin/* rewrite is in next.config.js.)
 * Any host starting with "admin." counts as the editor host, so admin.localhost works in dev.
 *
 * Redirect targets are built from the Host header: in a standalone deployment behind a reverse proxy,
 * req.url carries the server's bind address (e.g. http://0.0.0.0:3000), not the public hostname.
 */
const EDITOR_PATHS = /^\/(login|posts(\/.*)?|projects(\/.*)?|comments|settings|uploads\/.*|api\/admin\/.*)?$/

const notFound = () => new NextResponse('Not found', { status: 404 })
const redirect = (req: NextRequest, to: string, status = 307) => {
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || 'http'
  return NextResponse.redirect(new URL(to, `${proto}://${req.headers.get('host')}`), status)
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase()
  const { pathname } = req.nextUrl

  if (!host.startsWith('admin.')) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) return notFound()
    if (pathname === '/') return redirect(req, '/en', 308)
    return NextResponse.next()
  }

  if (!EDITOR_PATHS.test(pathname)) return notFound()

  // Uploaded images are public (published posts embed them); API routes authenticate themselves.
  if (pathname.startsWith('/uploads/') || pathname.startsWith('/api/admin/')) return NextResponse.next()

  const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  if (pathname === '/login') return authed ? redirect(req, '/') : NextResponse.next()
  return authed ? NextResponse.next() : redirect(req, '/login')
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|cur|pdf|zip)$).*)'],
}
