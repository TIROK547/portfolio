import { getDb } from '@/lib/db'
export const dynamic = 'force-dynamic'
export function GET() {
  try {
    getDb().prepare('SELECT 1 FROM settings LIMIT 1').get()
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[health]', error)
    return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
