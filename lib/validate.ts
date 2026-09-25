import { parseTags } from './slug'
import type { PostInput, ProjectInput } from './db'
import type { SiteSettings, StackGroup } from './settings'

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

/* --------------------------------------------------------------- settings */

const line = (v: unknown, max: number, label: string, required = true): Result<string> => {
  if (typeof v !== 'string') return { ok: false, error: `${label} is required` }
  const t = v.trim()
  if (t.length > max) return { ok: false, error: `${label}: max ${max} characters` }
  if (required && !t) return { ok: false, error: `${label} is required` }
  return { ok: true, value: t }
}

function groups(v: unknown, label: string): Result<StackGroup[]> {
  if (!Array.isArray(v) || v.length > 8) return { ok: false, error: `${label}: up to 8 groups` }
  const out: StackGroup[] = []
  for (const g of v) {
    const category = typeof g?.category === 'string' ? g.category.trim() : ''
    const items = Array.isArray(g?.items)
      ? g.items.filter((i: unknown): i is string => typeof i === 'string').map((i: string) => i.trim()).filter(Boolean)
      : []
    if (!category || category.length > 30) return { ok: false, error: `${label}: each group needs a name (max 30 chars)` }
    if (items.length === 0 || items.length > 15 || items.some((i: string) => i.length > 40)) {
      return { ok: false, error: `${label}: "${category}" needs 1-15 items, 40 chars each` }
    }
    out.push({ category, items })
  }
  if (out.length === 0) return { ok: false, error: `${label}: add at least one group` }
  return { ok: true, value: out }
}

export function parseSettingsInput(body: unknown): Result<SiteSettings> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid body' }
  const b = body as { profile?: Record<string, unknown>; contact?: Record<string, unknown> } & Record<string, unknown>
  const p = b.profile ?? {}
  const c = b.contact ?? {}

  const name = line(p.name, 60, 'name')
  if (!name.ok) return name
  const alias = line(p.alias, 30, 'alias')
  if (!alias.ok) return alias
  const role = line(p.role, 80, 'role')
  if (!role.ok) return role
  const location = line(p.location, 60, 'location')
  if (!location.ok) return location
  const bio = line(p.bio, 3000, 'bio')
  if (!bio.ok) return bio
  const birthDate = typeof p.birthDate === 'string' ? p.birthDate.trim() : ''
  const bd = new Date(`${birthDate}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(bd.getTime()) || bd > new Date() || bd.getUTCFullYear() < 1930) {
    return { ok: false, error: 'birth date must be a valid past date (YYYY-MM-DD)' }
  }

  const email = line(c.email, 120, 'email')
  if (!email.ok) return email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return { ok: false, error: 'email looks invalid' }
  const telegram = line(c.telegram, 40, 'telegram', false)
  if (!telegram.ok) return telegram
  const tg = telegram.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')
  if (tg && !/^[A-Za-z0-9_]{3,32}$/.test(tg)) return { ok: false, error: 'telegram: handle only, e.g. xyaes' }
  const github = line(c.github, 60, 'github', false)
  if (!github.ok) return github
  const gh = github.value.replace(/^@/, '').replace(/^https?:\/\/github\.com\//, '')
  if (gh && !/^[A-Za-z0-9-]{1,39}$/.test(gh)) return { ok: false, error: 'github: username only, e.g. tirok547' }
  const linkedin = line(c.linkedin, 200, 'linkedin', false)
  if (!linkedin.ok) return linkedin
  if (linkedin.value && !/^https:\/\/\S+$/.test(linkedin.value)) return { ok: false, error: 'linkedin must be an https URL (or empty)' }
  const intro = line(c.intro, 600, 'contact intro')
  if (!intro.ok) return intro
  const status = line(c.status, 100, 'status')
  if (!status.ok) return status
  const responseTime = line(c.responseTime, 100, 'response time')
  if (!responseTime.ok) return responseTime
  const timezone = line(c.timezone, 60, 'timezone')
  if (!timezone.ok) return timezone

  const stack = groups(b.stack, 'stack')
  if (!stack.ok) return stack
  const skills = groups(b.skills, 'skills')
  if (!skills.ok) return skills

  const interests = Array.isArray(b.interests)
    ? b.interests.filter((i): i is string => typeof i === 'string').map((i) => i.trim()).filter(Boolean)
    : []
  if (interests.length > 12 || interests.some((i) => i.length > 60)) {
    return { ok: false, error: 'interests: max 12 items, 60 chars each' }
  }
  const resumeUpdated = line(b.resumeUpdated, 40, 'resume "last updated"', false)
  if (!resumeUpdated.ok) return resumeUpdated

  return {
    ok: true,
    value: {
      profile: { name: name.value, alias: alias.value, role: role.value, location: location.value, birthDate, bio: bio.value },
      contact: {
        email: email.value, telegram: tg, github: gh, linkedin: linkedin.value,
        intro: intro.value, status: status.value, responseTime: responseTime.value, timezone: timezone.value,
      },
      stack: stack.value,
      skills: skills.value,
      interests,
      resumeUpdated: resumeUpdated.value,
    },
  }
}

/* --------------------------------------------------------------- comments */

const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N}_. -]{0,28}[\p{L}\p{N}]$/u

export function parseCommentInput(
  body: unknown,
  reserved: string[],
): Result<{ postSlug: string; author: string; text: string; website: string }> {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid body' }
  const b = body as Record<string, unknown>
  const postSlug = str(b.postSlug, 200)
  if (!postSlug) return { ok: false, error: 'missing post' }
  const author = str(b.author, 60)?.trim().replace(/\s+/g, ' ') ?? ''
  if (!NAME_RE.test(author)) {
    return { ok: false, error: 'username: 2-30 characters, letters, numbers, spaces, . _ -' }
  }
  const norm = (x: string) => x.toLowerCase().replace(/[\s._-]+/g, '')
  if (reserved.some((r) => r && norm(r) === norm(author))) {
    return { ok: false, error: 'that username is reserved, please pick another' }
  }
  const text = str(b.text, 4000)?.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() ?? ''
  if (!text) return { ok: false, error: 'write something first' }
  if (text.length > 1000) return { ok: false, error: 'comment is too long (max 1000 characters)' }
  if ((text.match(/https?:\/\//gi) ?? []).length > 2) return { ok: false, error: 'too many links' }
  return { ok: true, value: { postSlug, author, text, website: typeof b.website === 'string' ? b.website : '' } }
}
