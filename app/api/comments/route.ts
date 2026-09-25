import { NextRequest, NextResponse } from 'next/server'
import { addComment, getPostBySlug, getSettings } from '@/lib/db'
import { rateLimited } from '@/lib/rate-limit'
import { parseCommentInput } from '@/lib/validate'

export const runtime = 'nodejs'

/** Public endpoint: anyone can comment with just a username. Abuse control = origin check, honeypot, rate limit, reserved names. */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  try {
    if (!origin || new URL(origin).host !== req.headers.get('host')) throw new Error()
  } catch {
    return NextResponse.json({ error: 'bad origin' }, { status: 403 })
  }

  const settings = getSettings()
  const reserved = [
    settings.profile.alias,
    settings.profile.name,
    process.env.ADMIN_USER ?? '',
    'admin',
    'administrator',
    'owner',
    'tirok',
  ]
  const parsed = parseCommentInput(await req.json().catch(() => null), reserved)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { postSlug, author, text, website } = parsed.value

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (website) return NextResponse.json({ ok: true }, { status: 201 })

  const post = getPostBySlug(postSlug)
  if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 })

  // Only comments that would actually be saved count towards the limit, so typos in the form don't burn attempts.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(`comment:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'slow down, try again in a few minutes' }, { status: 429 })
  }

  addComment({ postId: post.id, author, body: text })
  return NextResponse.json({ ok: true }, { status: 201 })
}
