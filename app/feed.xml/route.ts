import { rssFeed } from '@/lib/discovery'
export const dynamic = 'force-dynamic'
export function GET() {
  return new Response(rssFeed(), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' } })
}
