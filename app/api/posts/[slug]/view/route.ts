import { getDb } from '@/lib/db'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 403 })
  const { slug } = await params
  const row = getDb().prepare("UPDATE posts SET views = views + 1 WHERE slug = ? AND status = 'published' RETURNING views").get(slug) as { views: number } | undefined
  return row ? Response.json(row) : new Response(null, { status: 404 })
}
