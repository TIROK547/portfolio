import { parseTags } from './slug'
import type { PostInput, ProjectInput } from './db'

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

const str = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length <= max ? v : null

function isSafeUrl(v: string): boolean {
  return v.startsWith('/uploads/') || /^https:\/\/\S+$/.test(v)
}

export function parsePostInput(body: unknown): Result<PostInput> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid body' }
  const b = body as Record<string, unknown>

  const title = str(b.title, 200)?.trim()
  if (!title) return { ok: false, error: 'title is required (max 200 chars)' }

  const content = str(b.content ?? '', 200_000)
  if (content === null) return { ok: false, error: 'content too long' }

  const excerpt = str(b.excerpt ?? '', 300)
  if (excerpt === null) return { ok: false, error: 'excerpt too long (max 300)' }

  const slug = str(b.slug ?? '', 80)
  if (slug === null) return { ok: false, error: 'slug too long' }

  const category = str(b.category ?? '', 40)
  if (category === null) return { ok: false, error: 'category too long (max 40)' }

  const cover = str(b.coverImage ?? '', 500)
  if (cover === null || (cover && !isSafeUrl(cover))) {
    return { ok: false, error: 'cover image must be an /uploads/ path or https URL' }
  }

  if (b.status !== 'draft' && b.status !== 'published') {
    return { ok: false, error: 'status must be draft or published' }
  }

  const rawTags = Array.isArray(b.tags) ? b.tags.filter((t): t is string => typeof t === 'string') : []
  return {
    ok: true,
    value: {
      title,
      content,
      excerpt,
      slug: slug.trim(),
      category: category.trim(),
      coverImage: cover,
      status: b.status,
      tags: parseTags(rawTags),
    },
  }
}

export function parseProjectInput(body: unknown): Result<ProjectInput> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid body' }
  const b = body as Record<string, unknown>

  const name = str(b.name, 80)?.trim()
  if (!name) return { ok: false, error: 'name is required (max 80 chars)' }
  const description = str(b.description, 2000)?.trim()
  if (!description) return { ok: false, error: 'description is required (max 2000 chars)' }
  const github = str(b.github, 300)?.trim()
  if (!github || !/^https:\/\/\S+$/.test(github)) return { ok: false, error: 'github must be an https URL' }
  if (b.status !== 'active' && b.status !== 'wip' && b.status !== 'archived') {
    return { ok: false, error: 'status must be active, wip or archived' }
  }
  const stack = Array.isArray(b.stack)
    ? b.stack
        .filter((s): s is string => typeof s === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  if (stack.length > 12 || stack.some((s) => s.length > 30)) {
    return { ok: false, error: 'stack: max 12 items, 30 chars each' }
  }
  const sortOrder = Number.isInteger(b.sortOrder) ? (b.sortOrder as number) : 0
  return { ok: true, value: { name, description, github, status: b.status, stack, sortOrder, featured: b.featured === true } }
}
