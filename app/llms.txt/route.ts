import { llmsIndex } from '@/lib/discovery'
export const dynamic = 'force-dynamic'
export function GET() {
  return new Response(llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' } })
}
