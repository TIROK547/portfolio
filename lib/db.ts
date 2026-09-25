import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { seedProjects } from './seed-projects'
import { slugify, makeExcerpt, readingMinutes } from './slug'
import { mergeSettings, type SiteSettings } from './settings'

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')

export type PostStatus = 'draft' | 'published'
export type ProjectStatus = 'active' | 'wip' | 'archived'

export interface PostSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  category: { name: string; slug: string } | null
  tags: string[]
  status: PostStatus
  readingMinutes: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}
export interface Post extends PostSummary {
  content: string
}
export interface Project {
  id: number
  name: string
  description: string
  stack: string[]
  github: string
  status: ProjectStatus
  sortOrder: number
  featured: boolean
}
export interface PostInput {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImage?: string | null
  category?: string | null
  tags: string[]
  status: PostStatus
}
export type ProjectInput = Omit<Project, 'id'>

export class SlugTakenError extends Error {
  constructor() {
    super('slug already in use')
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS posts (
  id              INTEGER PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL DEFAULT '',
  cover_image     TEXT,
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  reading_minutes INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  published_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  stack       TEXT NOT NULL DEFAULT '[]',
  github      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','wip','archived')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  featured    INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  parent_id  INTEGER          REFERENCES comments(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_admin   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
`

const g = globalThis as unknown as { __db?: Database.Database }

export function getDb(): Database.Database {
  if (g.__db) return g.__db
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  const db = new Database(path.join(DATA_DIR, 'site.db'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)

  const { n } = db.prepare('SELECT COUNT(*) AS n FROM projects').get() as { n: number }
  if (n === 0) {
    const ins = db.prepare(
      'INSERT INTO projects (name, description, stack, github, status, sort_order, featured) VALUES (?,?,?,?,?,?,?)',
    )
    db.transaction(() => {
      seedProjects.forEach((p, i) =>
        ins.run(p.name, p.description, JSON.stringify(p.stack), p.github, p.status, i, p.featured ? 1 : 0),
      )
    })()
  }
  g.__db = db
  return db
}

/* ------------------------------------------------------------------ posts */

interface PostRow {
  id: number
  slug: string
  title: string
  excerpt: string
  content?: string
  cover_image: string | null
  status: PostStatus
  reading_minutes: number
  created_at: string
  updated_at: string
  published_at: string | null
  category_name: string | null
  category_slug: string | null
}

const POST_COLS = `p.id, p.slug, p.title, p.excerpt, p.cover_image, p.status, p.reading_minutes,
  p.created_at, p.updated_at, p.published_at, c.name AS category_name, c.slug AS category_slug`
const POST_FROM = `FROM posts p LEFT JOIN categories c ON c.id = p.category_id`

function hydrate(rows: PostRow[]): Post[] {
  if (rows.length === 0) return []
  const db = getDb()
  const ids = rows.map((r) => r.id)
  const tagRows = db
    .prepare(
      `SELECT pt.post_id AS post_id, t.name AS name FROM post_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id IN (${ids.map(() => '?').join(',')}) ORDER BY t.name`,
    )
    .all(...ids) as { post_id: number; name: string }[]
  const byPost = new Map<number, string[]>()
  for (const t of tagRows) byPost.set(t.post_id, [...(byPost.get(t.post_id) ?? []), t.name])
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content ?? '',
    coverImage: r.cover_image,
    category: r.category_name && r.category_slug ? { name: r.category_name, slug: r.category_slug } : null,
    tags: byPost.get(r.id) ?? [],
    status: r.status,
    readingMinutes: r.reading_minutes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }))
}

export function listPosts(opts: {
  publishedOnly?: boolean
  tag?: string
  category?: string
  limit?: number
} = {}): PostSummary[] {
  const where: string[] = []
  const args: (string | number)[] = []
  if (opts.publishedOnly) where.push(`p.status = 'published'`)
  if (opts.category) {
    where.push('c.slug = ?')
    args.push(opts.category)
  }
  if (opts.tag) {
    where.push(
      `EXISTS (SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id AND t.name = ?)`,
    )
    args.push(opts.tag)
  }
  const sql = `SELECT ${POST_COLS} ${POST_FROM}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY COALESCE(p.published_at, p.updated_at) DESC, p.id DESC LIMIT ?`
  const rows = getDb().prepare(sql).all(...args, opts.limit ?? 100) as PostRow[]
  return hydrate(rows).map(({ content: _c, ...rest }) => rest)
}

export function getPostBySlug(slug: string, publishedOnly = true): Post | null {
  const row = getDb()
    .prepare(
      `SELECT ${POST_COLS}, p.content ${POST_FROM} WHERE p.slug = ? ${publishedOnly ? `AND p.status = 'published'` : ''}`,
    )
    .get(slug) as PostRow | undefined
  return row ? hydrate([row])[0] : null
}

export function getPostById(id: number): Post | null {
  const row = getDb()
    .prepare(`SELECT ${POST_COLS}, p.content ${POST_FROM} WHERE p.id = ?`)
    .get(id) as PostRow | undefined
  return row ? hydrate([row])[0] : null
}

export function listCategories(publishedOnly = true): { name: string; slug: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT c.name, c.slug, COUNT(p.id) AS count FROM categories c
       JOIN posts p ON p.category_id = c.id ${publishedOnly ? `AND p.status = 'published'` : ''}
       GROUP BY c.id ORDER BY count DESC, c.name`,
    )
    .all() as { name: string; slug: string; count: number }[]
}

export function listTags(publishedOnly = true): { name: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT t.name, COUNT(p.id) AS count FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       JOIN posts p ON p.id = pt.post_id ${publishedOnly ? `AND p.status = 'published'` : ''}
       GROUP BY t.id ORDER BY count DESC, t.name`,
    )
    .all() as { name: string; count: number }[]
}

/** Category names for the editor's autocomplete (includes ones only used by drafts). */
export function allCategoryNames(): string[] {
  return (getDb().prepare('SELECT name FROM categories ORDER BY name').all() as { name: string }[]).map(
    (r) => r.name,
  )
}

function uniqueSlug(base: string, excludeId?: number): string {
  const db = getDb()
  const root = base || `post-${Date.now()}`
  let candidate = root
  for (let i = 2; ; i++) {
    const hit = db.prepare('SELECT id FROM posts WHERE slug = ?').get(candidate) as { id: number } | undefined
    if (!hit || hit.id === excludeId) return candidate
    candidate = `${root}-${i}`
  }
}

export function savePost(input: PostInput, id?: number): Post | null {
  const db = getDb()
  const now = new Date().toISOString()

  const run = db.transaction((): number => {
    let slug: string
    if (input.slug) {
      slug = slugify(input.slug)
      const hit = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug) as { id: number } | undefined
      if (!slug || (hit && hit.id !== id)) throw new SlugTakenError()
    } else {
      slug = uniqueSlug(slugify(input.title), id)
    }

    let categoryId: number | null = null
    const catName = input.category?.trim()
    if (catName) {
      const catSlug = slugify(catName) || catName
      db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)').run(catName, catSlug)
      categoryId = (
        db.prepare('SELECT id FROM categories WHERE slug = ? OR name = ?').get(catSlug, catName) as { id: number }
      ).id
    }

    const excerpt = input.excerpt?.trim() || makeExcerpt(input.content)
    const minutes = readingMinutes(input.content)
    const cover = input.coverImage?.trim() || null

    let postId: number
    if (id === undefined) {
      const res = db
        .prepare(
          `INSERT INTO posts (slug, title, excerpt, content, cover_image, category_id, status,
             reading_minutes, created_at, updated_at, published_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(slug, input.title, excerpt, input.content, cover, categoryId, input.status, minutes, now, now,
          input.status === 'published' ? now : null)
      postId = Number(res.lastInsertRowid)
    } else {
      const prev = db.prepare('SELECT published_at FROM posts WHERE id = ?').get(id) as
        | { published_at: string | null }
        | undefined
      if (!prev) throw new Error('not found')
      // Keep the original publish date across edits; set it the first time it goes live.
      const publishedAt = input.status === 'published' ? (prev.published_at ?? now) : prev.published_at
      db.prepare(
        `UPDATE posts SET slug=?, title=?, excerpt=?, content=?, cover_image=?, category_id=?, status=?,
           reading_minutes=?, updated_at=?, published_at=? WHERE id=?`,
      ).run(slug, input.title, excerpt, input.content, cover, categoryId, input.status, minutes, now, publishedAt, id)
      postId = id
    }

    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId)
    for (const tag of input.tags) {
      db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tag)
      const t = db.prepare('SELECT id FROM tags WHERE name = ?').get(tag) as { id: number }
      db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(postId, t.id)
    }
    return postId
  })

  return getPostById(run())
}

export function deletePost(id: number): boolean {
  return getDb().prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0
}

/* --------------------------------------------------------------- projects */

interface ProjectRow {
  id: number
  name: string
  description: string
  stack: string
  github: string
  status: ProjectStatus
  sort_order: number
  featured: number
}

const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  description: r.description,
  stack: JSON.parse(r.stack) as string[],
  github: r.github,
  status: r.status,
  sortOrder: r.sort_order,
  featured: r.featured === 1,
})

export function listProjects(opts: { featuredOnly?: boolean } = {}): Project[] {
  const where = opts.featuredOnly ? 'WHERE featured = 1' : ''
  return (getDb().prepare(`SELECT * FROM projects ${where} ORDER BY sort_order, id`).all() as ProjectRow[]).map(
    toProject,
  )
}

export function getProject(id: number): Project | null {
  const r = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
  return r ? toProject(r) : null
}

export function saveProject(input: ProjectInput, id?: number): Project | null {
  const db = getDb()
  const args = [
    input.name,
    input.description,
    JSON.stringify(input.stack),
    input.github,
    input.status,
    input.sortOrder,
    input.featured ? 1 : 0,
  ]
  if (id === undefined) {
    const res = db
      .prepare(
        'INSERT INTO projects (name, description, stack, github, status, sort_order, featured) VALUES (?,?,?,?,?,?,?)',
      )
      .run(...args)
    return getProject(Number(res.lastInsertRowid))
  }
  const res = db
    .prepare('UPDATE projects SET name=?, description=?, stack=?, github=?, status=?, sort_order=?, featured=? WHERE id=?')
    .run(...args, id)
  return res.changes ? getProject(id) : null
}

export function deleteProject(id: number): boolean {
  return getDb().prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0
}

/* --------------------------------------------------------------- settings */

export function getSettings(): SiteSettings {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'site'").get() as { value: string } | undefined
  let stored: unknown = null
  try {
    stored = row ? JSON.parse(row.value) : null
  } catch {}
  return mergeSettings(stored)
}

export function saveSettings(value: SiteSettings): SiteSettings {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(value))
  return getSettings()
}

/* --------------------------------------------------------------- comments */

export interface Comment {
  id: number
  postId: number
  parentId: number | null
  author: string
  body: string
  isAdmin: boolean
  createdAt: string
}
export interface AdminComment extends Comment {
  postTitle: string
  postSlug: string
}

interface CommentRow {
  id: number
  post_id: number
  parent_id: number | null
  author: string
  body: string
  is_admin: number
  created_at: string
  post_title?: string
  post_slug?: string
}

const toComment = (r: CommentRow): Comment => ({
  id: r.id,
  postId: r.post_id,
  parentId: r.parent_id,
  author: r.author,
  body: r.body,
  isAdmin: r.is_admin === 1,
  createdAt: r.created_at,
})

export function listComments(postId: number): Comment[] {
  const rows = getDb()
    .prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC, id ASC')
    .all(postId) as CommentRow[]
  return rows.map(toComment)
}

export function listCommentsForAdmin(): AdminComment[] {
  const rows = getDb()
    .prepare(
      `SELECT c.*, p.title AS post_title, p.slug AS post_slug
         FROM comments c JOIN posts p ON p.id = c.post_id
        ORDER BY c.created_at DESC, c.id DESC LIMIT 500`,
    )
    .all() as CommentRow[]
  return rows.map((r) => ({ ...toComment(r), postTitle: r.post_title ?? '', postSlug: r.post_slug ?? '' }))
}

export function getComment(id: number): Comment | null {
  const r = getDb().prepare('SELECT * FROM comments WHERE id = ?').get(id) as CommentRow | undefined
  return r ? toComment(r) : null
}

/** Replies always hang off a top-level comment: replying to a reply attaches to that reply's parent. */
export function addComment(input: {
  postId: number
  parentId?: number | null
  author: string
  body: string
  isAdmin?: boolean
}): Comment | null {
  const db = getDb()
  let parentId: number | null = null
  if (input.parentId) {
    const parent = getComment(input.parentId)
    if (!parent || parent.postId !== input.postId) return null
    parentId = parent.parentId ?? parent.id
  }
  const info = db
    .prepare('INSERT INTO comments (post_id, parent_id, author, body, is_admin, created_at) VALUES (?,?,?,?,?,?)')
    .run(input.postId, parentId, input.author, input.body, input.isAdmin ? 1 : 0, new Date().toISOString())
  return getComment(Number(info.lastInsertRowid))
}

export function deleteComment(id: number): boolean {
  return getDb().prepare('DELETE FROM comments WHERE id = ?').run(id).changes > 0
}
