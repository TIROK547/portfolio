'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Markdown from '@/components/Markdown'
import type { Post } from '@/lib/db'
import { makeExcerpt } from '@/lib/slug'

interface Props {
  initial?: Post
  categories: string[]
  siteUrl: string
}

type View = 'write' | 'preview' | 'split'

const toolBtn =
  'px-2 py-1 text-xs border border-terminal-text-dark/20 hover:border-terminal-accent-cyan hover:text-terminal-accent-cyan transition-colors'

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
  const [view, setView] = useState<View>('write')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const ta = useRef<HTMLTextAreaElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
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

  // execCommand keeps the browser's undo stack intact; setRangeText is the fallback.
  function replaceRange(start: number, end: number, text: string, selFrom?: number, selTo?: number) {
    const el = ta.current
    if (!el) return
    el.focus()
    el.setSelectionRange(start, end)
    if (!document.execCommand('insertText', false, text)) {
      el.setRangeText(text, start, end, 'end')
      setContent(el.value)
    }
    const from = selFrom ?? start + text.length
    el.setSelectionRange(from, selTo ?? from)
  }

  function wrap(before: string, after: string, placeholder: string) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const sel = value.slice(s, e) || placeholder
    replaceRange(s, e, before + sel + after, s + before.length, s + before.length + sel.length)
  }

  function prefixLines(prefix: string, stripHeading = false) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const nl = value.indexOf('\n', e)
    const lineEnd = nl === -1 ? value.length : nl
    const block = value
      .slice(lineStart, lineEnd)
      .split('\n')
      .map((l) => prefix + (stripHeading ? l.replace(/^#{1,6}\s+/, '') : l))
      .join('\n')
    replaceRange(lineStart, lineEnd, block)
  }

  function insertBlock(text: string) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const lead = s > 0 && value[s - 1] !== '\n' ? '\n\n' : s > 0 && value[s - 2] !== '\n' ? '\n' : ''
    replaceRange(s, e, `${lead}${text}\n`)
  }

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

  async function insertImages(files: File[]) {
    for (const f of files) {
      const url = await upload(f)
      if (url) {
        const alt = f.name.replace(/\.[^.]+$/, '').replace(/[[\]]/g, '') || 'image'
        insertBlock(`![${alt}](${url})`)
      }
    }
  }

  const imagesFrom = (list: FileList | null | undefined) =>
    Array.from(list ?? []).filter((f) => f.type.startsWith('image/'))

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

  /* ------------------------------------------------------------------ view */

  const writeHidden = view === 'preview'
  const previewHidden = view === 'write'

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

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={toolBtn} onClick={() => prefixLines('## ', true)} title="Heading">H2</button>
            <button type="button" className={toolBtn} onClick={() => prefixLines('### ', true)} title="Subheading">H3</button>
            <button type="button" className={`${toolBtn} font-bold`} onClick={() => wrap('**', '**', 'bold')} title="Bold">B</button>
            <button type="button" className={`${toolBtn} italic`} onClick={() => wrap('*', '*', 'italic')} title="Italic">I</button>
            <button type="button" className={toolBtn} onClick={() => wrap('`', '`', 'code')} title="Inline code">{'`c`'}</button>
            <button type="button" className={toolBtn} onClick={() => wrap('\n```\n', '\n```\n', 'code')} title="Code block">{'```'}</button>
            <button type="button" className={toolBtn} onClick={() => prefixLines('> ')} title="Quote">quote</button>
            <button type="button" className={toolBtn} onClick={() => prefixLines('- ')} title="Bullet list">list</button>
            <button type="button" className={toolBtn} onClick={() => prefixLines('1. ')} title="Numbered list">1.</button>
            <button type="button" className={toolBtn} onClick={() => wrap('[', '](https://)', 'link text')} title="Link">link</button>
            <button type="button" className={toolBtn} onClick={() => insertBlock('---')} title="Divider">—</button>
            <button type="button" className={`${toolBtn} text-terminal-accent-green border-terminal-accent-green/40`}
              onClick={() => imageInput.current?.click()} disabled={uploading}>
              {uploading ? 'uploading…' : 'image'}
            </button>
            <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden
              onChange={(e) => {
                void insertImages(imagesFrom(e.target.files))
                e.target.value = ''
              }} />

            <div className="ms-auto flex gap-1 text-xs">
              {(['write', 'preview', 'split'] as View[]).map((v) => (
                <button key={v} type="button" onClick={() => setView(v)}
                  className={`px-2 py-1 border ${v === 'split' ? 'hidden lg:block' : ''} ${
                    view === v ? 'border-terminal-accent-cyan text-terminal-accent-cyan' : 'border-terminal-text-dark/20'
                  }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className={view === 'split' ? 'lg:grid lg:grid-cols-2 lg:gap-4' : ''}>
            <textarea
              ref={ta}
              dir="auto"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={(e) => {
                const imgs = imagesFrom(e.clipboardData.files)
                if (imgs.length) {
                  e.preventDefault()
                  void insertImages(imgs)
                }
              }}
              onDrop={(e) => {
                const imgs = imagesFrom(e.dataTransfer.files)
                if (imgs.length) {
                  e.preventDefault()
                  void insertImages(imgs)
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              placeholder={'Write in Markdown. Paste or drop images straight in.\n\n## A header\nSome thoughts…'}
              className={`adm-input font-mono leading-relaxed min-h-[28rem] h-[70vh] resize-y ${writeHidden ? 'hidden' : ''}`}
              spellCheck
            />
            <div
              className={`border border-terminal-text-dark/20 p-4 min-h-[28rem] max-h-[70vh] overflow-y-auto ${previewHidden ? 'hidden' : ''}`}
            >
              {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-terminal-text-dark/40">Nothing to preview yet.</p>}
            </div>
          </div>
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
