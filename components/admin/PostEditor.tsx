'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import MarkdownEditor from './MarkdownEditor'
import type { Post } from '@/lib/db'
import { makeExcerpt } from '@/lib/slug'

interface Props {
  initial?: Post
  categories: string[]
  siteUrl: string
}

export default function PostEditor({ initial, categories, siteUrl }: Props) {
  const router = useRouter()
  const [id, setId] = useState<number | undefined>(initial?.id)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [category, setCategory] = useState(initial?.category?.name ?? '')
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).map((t) => `#${t}`).join(' '))
  // The server auto-generates an excerpt when this is empty; only show one the user typed themselves.
  const [excerpt, setExcerpt] = useState(
    initial && initial.excerpt !== makeExcerpt(initial.content) ? initial.excerpt : '',
  )
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status ?? 'draft')
  const [content, setContent] = useState(initial?.content ?? '')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const coverInput = useRef<HTMLInputElement>(null)

  const snapshot = JSON.stringify([title, slug, category, tagsText, excerpt, coverImage, status, content])
  const [saved, setSaved] = useState(snapshot)
  const dirty = snapshot !== saved

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  // Ctrl/Cmd+S saves. Re-bound each render so it always sees current state.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  /* ---------------------------------------------------------- text editing */

  async function upload(file: File): Promise<string | null> {
    setUploading(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'upload failed')
      return data.url as string
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'upload failed' })
      return null
    } finally {
      setUploading(false)
    }
  }

  /* ---------------------------------------------------------------- saving */

  async function save() {
    if (busy) return
    if (!title.trim()) {
      setMessage({ kind: 'error', text: 'Add a title first.' })
      return
    }
    setBusy(true)
    setMessage(null)
    const body = {
      title,
      // Existing posts keep their URL; new posts only send a slug if it was typed by hand.
      slug: id || slugTouched ? slug : '',
      content,
      excerpt,
      category,
      coverImage,
      status,
      tags: tagsText.split(/[,\s]+/).filter(Boolean),
    }
    try {
      const res = await fetch(id ? `/api/admin/posts/${id}` : '/api/admin/posts', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `save failed (${res.status})`)
      const post = data as Post
      // Reflect server-side normalisation (slug, tags) in the form.
      const nextTags = post.tags.map((t) => `#${t}`).join(' ')
      setSlug(post.slug)
      setTagsText(nextTags)
      setCategory(post.category?.name ?? '')
      setSaved(JSON.stringify([title, post.slug, post.category?.name ?? '', nextTags, excerpt, coverImage, status, content]))
      setMessage({ kind: 'ok', text: `Saved at ${new Date().toLocaleTimeString()}` })
      if (!id) {
        setId(post.id)
        router.replace(`/posts/${post.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'save failed' })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!id || !confirm('Delete this post permanently?')) return
    setBusy(true)
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSaved(snapshot) // don't trigger the unsaved-changes prompt
      router.replace('/')
      router.refresh()
    } else {
      setMessage({ kind: 'error', text: 'delete failed' })
      setBusy(false)
    }
  }

  /* --------------------------------------------------------- JSON import */

  function importFromJson() {
    setJsonError(null)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      setJsonError('Invalid JSON — could not parse.')
      return
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setJsonError('Expected a JSON object at the top level.')
      return
    }

    const getString = (key: string) => (typeof parsed[key] === 'string' ? (parsed[key] as string).trim() : '')

    const nextTitle = getString('title')
    const nextCategory = getString('category')
    const nextCoverImage = getString('image')
    const nextContent = getString('body')

    // tags: array of strings or a space/comma-separated string
    let nextTagsText = tagsText
    if (Array.isArray(parsed['tags'])) {
      nextTagsText = (parsed['tags'] as unknown[])
        .filter((t) => typeof t === 'string')
        .map((t) => `#${(t as string).replace(/^#/, '')}`)
        .join(' ')
    } else if (typeof parsed['tags'] === 'string') {
      nextTagsText = (parsed['tags'] as string)
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((t) => `#${t.replace(/^#/, '')}`)
        .join(' ')
    }

    if (!nextTitle && !nextContent) {
      setJsonError('JSON must include at least "title" or "body".')
      return
    }

    if (nextTitle) setTitle(nextTitle)
    if (nextCategory) setCategory(nextCategory)
    if (nextCoverImage) setCoverImage(nextCoverImage)
    if (nextContent) setContent(nextContent)
    if (nextTagsText) setTagsText(nextTagsText)

    setJsonText('')
    setJsonOpen(false)
    setJsonError(null)
  }

  /* ------------------------------------------------------------------ view */


  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">
          <span className="text-terminal-accent-red">$</span> {id ? 'edit' : 'new'} post
          {dirty && <span className="ms-3 text-xs text-terminal-accent-yellow">● unsaved</span>}
        </h1>
        <div className="flex items-center gap-3">
          {message && (
            <span role="status" className={`text-xs ${message.kind === 'ok' ? 'text-terminal-accent-green' : 'text-terminal-accent-red'}`}>
              {message.text}
            </span>
          )}
          {id && status === 'published' && slug && (
            <a href={`${siteUrl}/en/blog/${encodeURIComponent(slug)}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-terminal-accent-yellow hover:text-terminal-accent-blue">
              view live
            </a>
          )}
          {id && <button type="button" className="adm-btn adm-btn-danger" onClick={remove} disabled={busy}>delete</button>}
          <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
            {busy ? 'saving…' : 'save'}
          </button>
        </div>
      </div>

      {/* JSON import panel */}
      <div className="mb-6 border border-terminal-text-dark/20">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-terminal-text-dark/60 hover:text-terminal-accent-cyan transition-colors"
          onClick={() => { setJsonOpen((o) => !o); setJsonError(null) }}
        >
          <span>
            <span className="text-terminal-accent-cyan me-2">{'>'}</span>
            import from json
          </span>
          <span className="font-mono">{jsonOpen ? '▲' : '▼'}</span>
        </button>

        {jsonOpen && (
          <div className="border-t border-terminal-text-dark/20 p-4 space-y-3">
            <p className="text-xs text-terminal-text-dark/50">
              Paste a post JSON — <code className="text-terminal-accent-cyan">title</code>,{' '}
              <code className="text-terminal-accent-cyan">body</code>,{' '}
              <code className="text-terminal-accent-cyan">category</code>,{' '}
              <code className="text-terminal-accent-cyan">tags</code>,{' '}
              <code className="text-terminal-accent-cyan">image</code> are recognised.
              Existing fields will be overwritten.
            </p>
            <textarea
              className="adm-input font-mono text-xs min-h-[10rem] resize-y"
              placeholder={'{\n  "title": "My Post",\n  "category": "Backend",\n  "tags": ["go", "api"],\n  "image": "https://…",\n  "body": "# My Post\\n\\nContent here…"\n}'}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            {jsonError && (
              <p className="text-xs text-terminal-accent-red">{jsonError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={importFromJson}
                disabled={!jsonText.trim()}
              >
                import
              </button>
              <button
                type="button"
                className="adm-btn"
                onClick={() => { setJsonOpen(false); setJsonText(''); setJsonError(null) }}
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <input
            dir="auto"
            className="adm-input !text-lg !py-3 font-semibold"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div>
            <label className="adm-label" htmlFor="status">status</label>
            <select id="status" className="adm-input" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
              <option value="draft">draft — only you</option>
              <option value="published">published — on the portfolio</option>
            </select>
          </div>

          <div>
            <label className="adm-label" htmlFor="category">category</label>
            <input id="category" className="adm-input" list="category-list" value={category}
              onChange={(e) => setCategory(e.target.value)} maxLength={40} placeholder="e.g. life, backend" />
            <datalist id="category-list">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="adm-label" htmlFor="tags">hashtags</label>
            <input id="tags" dir="auto" className="adm-input" value={tagsText} onChange={(e) => setTagsText(e.target.value)}
              placeholder="#python #daily #linux" />
          </div>

          <div>
            <label className="adm-label" htmlFor="slug">url slug</label>
            <input id="slug" dir="auto" className="adm-input" value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="auto from title" maxLength={80} />
          </div>

          <div>
            <label className="adm-label" htmlFor="cover">cover image</label>
            <div className="flex gap-2">
              <input id="cover" className="adm-input" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/uploads/… or https://…" />
              <button type="button" className="adm-btn shrink-0" onClick={() => coverInput.current?.click()} disabled={uploading}>
                upload
              </button>
              <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) {
                    const url = await upload(f)
                    if (url) setCoverImage(url)
                  }
                }} />
            </div>
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" className="mt-2 w-full h-28 object-cover border border-terminal-text-dark/20" />
            )}
          </div>

          <div>
            <label className="adm-label" htmlFor="excerpt">excerpt (optional)</label>
            <textarea id="excerpt" dir="auto" className="adm-input h-24 resize-y" value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)} maxLength={300} placeholder="Auto-generated from the text if empty" />
          </div>
        </aside>
      </div>
    </div>
  )
}
