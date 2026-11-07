'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectImage } from '@/lib/db'
import MarkdownEditor from './MarkdownEditor'
import TerminalSelect from '@/components/TerminalSelect'

export default function ProjectForm({ initial }: { initial?: Project }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    summary: initial?.summary ?? '',
    description: initial?.description ?? '',
    github: initial?.github ?? '',
    liveUrl: initial?.liveUrl ?? '',
    status: initial?.status ?? 'active',
    visibility: initial?.visibility ?? 'draft',
    featured: initial?.featured ?? false,
    sortOrder: initial?.sortOrder ?? 0,
    stack: initial?.stack ?? [],
    images: initial?.images ?? [],
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [stackText, setStackText] = useState((initial?.stack ?? []).join(', '))
  const [imageUrl, setImageUrl] = useState('')
  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((f) => ({ ...f, [key]: value }))
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch(
        initial ? `/api/admin/projects/${initial.id}` : '/api/admin/projects',
        {
          method: initial ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            stack: [
              ...new Set(
                stackText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              ),
            ],
          }),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.replace('/projects')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save project.')
      setBusy(false)
    }
  }
  async function importReadme() {
    if (
      form.description &&
      !confirm(
        'Replace the current description with the GitHub README? Unsaved description edits will be replaced.',
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/projects/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github: form.github }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      update('description', data.description)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'README import failed.')
    } finally {
      setBusy(false)
    }
  }
  async function upload(files: FileList | null) {
    if (!files) return
    if (form.images.length + files.length > 20) {
      setError('A project can have up to 20 images.')
      return
    }
    setBusy(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.set('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setForm((f) => ({
          ...f,
          images: [
            ...f.images,
            {
              url: data.url,
              alt: file.name.replace(/\.[^.]+$/, ''),
              kind: 'screenshot',
            },
          ],
        }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }
  function editImage(index: number, change: Partial<ProjectImage>) {
    update(
      'images',
      form.images.map((img, i) => (i === index ? { ...img, ...change } : img)),
    )
  }
  function moveImage(index: number, direction: number) {
    const images = [...form.images]
    ;[images[index], images[index + direction]] = [
      images[index + direction],
      images[index],
    ]
    update('images', images)
  }
  async function remove() {
    if (!initial || !confirm(`Delete "${initial.name}"?`)) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed.')
      router.replace('/projects')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        <div>
          <label className="adm-label" htmlFor="name">
            name
          </label>
          <input
            id="name"
            className="adm-input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div>
          <label className="adm-label" htmlFor="summary">
            short summary
          </label>
          <textarea
            id="summary"
            className="adm-input"
            value={form.summary}
            onChange={(e) => update('summary', e.target.value)}
            maxLength={300}
            placeholder="A short introduction for project cards. Defaults to an excerpt of your description."
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {(['github', 'liveUrl'] as const).map((key) => (
            <div key={key}>
              <label className="adm-label" htmlFor={key}>
                {key === 'github'
                  ? 'GitHub repository (optional)'
                  : 'live URL (optional)'}
              </label>
              <input
                id={key}
                type="url"
                className="adm-input"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={
                  key === 'github'
                    ? 'https://github.com/owner/repo'
                    : 'https://example.com'
                }
              />
            </div>
          ))}
        </div>
        <section className="space-y-3">
          <div className="flex flex-wrap justify-between gap-2">
            <label className="adm-label" htmlFor="description">
              description · Markdown
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="adm-btn"
                disabled={!form.github}
                onClick={importReadme}
              >
                refresh from GitHub
              </button>
            </div>
          </div>
          <p className="text-xs opacity-60">
            Leave empty to import the README when saving. Existing descriptions
            are kept until you explicitly refresh.
          </p>
          <MarkdownEditor
            id="description"
            value={form.description}
            onChange={(value) => update('description', value)}
          />
        </section>
        <div>
          <label className="adm-label" htmlFor="stack">
            stack (comma separated)
          </label>
          <input
            id="stack"
            className="adm-input"
            value={stackText}
            onChange={(e) => setStackText(e.target.value)}
            placeholder="Django, PostgreSQL, Redis"
          />
          <p className="text-xs text-terminal-text-dark/50 mt-2">
            Up to 12 technologies. Matching names use the same icons as the rest
            of the site.
          </p>
        </div>
        <section className="space-y-3">
          <h2 className="adm-label">images · first image is the cover</h2>
          <p className="text-xs opacity-60">
            Up to 20 images. Upload PNG, JPG, GIF or WebP (8 MB each), or add an
            HTTPS URL.
          </p>
          <label className="adm-label">
            upload images
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="block mt-2 text-sm"
              onChange={(e) => {
                void upload(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
          <div className="flex gap-2">
            <input
              aria-label="Image URL"
              className="adm-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/screenshot.png"
            />
            <button
              type="button"
              className="adm-btn shrink-0"
              disabled={!imageUrl || form.images.length >= 20}
              onClick={() => {
                if (!/^https:\/\/\S+$/.test(imageUrl)) {
                  setError('Image URL must use HTTPS.')
                  return
                }
                update('images', [
                  ...form.images,
                  { url: imageUrl, alt: '', kind: 'screenshot' },
                ])
                setImageUrl('')
              }}
            >
              add URL
            </button>
          </div>
          {form.images.map((img, i) => (
            <div
              key={i}
              className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-3 flex flex-wrap sm:flex-nowrap gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="w-24 h-20 object-contain bg-black/20"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <label className="adm-label">
                  image {i + 1}
                  {i === 0 ? ' · cover' : ''}
                  <input
                    className="adm-input"
                    value={img.url}
                    onChange={(e) => editImage(i, { url: e.target.value })}
                    required
                  />
                </label>
                <input
                  aria-label={`Image ${i + 1} alt text`}
                  className="adm-input"
                  value={img.alt}
                  onChange={(e) => editImage(i, { alt: e.target.value })}
                  maxLength={200}
                  placeholder="Describe the image for accessibility"
                />
                <div className="flex flex-wrap gap-2">
                  <TerminalSelect
                    admin
                    hideLabel
                    label={`Image ${i + 1} type`}
                    value={img.kind}
                    disabled={busy}
                    onChange={(value) =>
                      editImage(i, { kind: value as ProjectImage['kind'] })
                    }
                    options={[
                      { value: 'screenshot', label: 'screenshot' },
                      { value: 'logo', label: 'logo' },
                    ]}
                  />
                  <button
                    type="button"
                    className="adm-btn"
                    disabled={i === 0}
                    onClick={() => moveImage(i, -1)}
                    aria-label={`Move image ${i + 1} earlier`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-btn"
                    disabled={i === form.images.length - 1}
                    onClick={() => moveImage(i, 1)}
                    aria-label={`Move image ${i + 1} later`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="adm-btn"
                    onClick={() =>
                      update(
                        'images',
                        form.images.filter((_, n) => n !== i),
                      )
                    }
                  >
                    remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
        <div className="grid sm:grid-cols-3 gap-4">
          <TerminalSelect
            admin
            label="status"
            value={form.status}
            disabled={busy}
            onChange={(value) => update('status', value as Project['status'])}
            options={[
              { value: 'active', label: 'active' },
              { value: 'wip', label: 'in progress' },
              { value: 'archived', label: 'archived' },
              { value: 'abandoned', label: 'abandoned' },
            ]}
          />
          <TerminalSelect
            admin
            label="visibility"
            value={form.visibility}
            disabled={busy}
            onChange={(value) =>
              update('visibility', value as Project['visibility'])
            }
            options={[
              { value: 'draft', label: 'draft' },
              { value: 'published', label: 'published' },
            ]}
          />
          <label className="adm-label">
            order (lower = first)
            <input
              type="number"
              className="adm-input"
              value={form.sortOrder}
              onChange={(e) => update('sortOrder', Number(e.target.value))}
            />
          </label>
        </div>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update('featured', e.target.checked)}
          />
          feature on home page (when published)
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="text-terminal-accent-red text-sm">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button className="adm-btn adm-btn-primary" disabled={busy}>
          {busy ? 'working…' : 'save project'}
        </button>
        {initial && (
          <button
            type="button"
            className="adm-btn adm-btn-danger"
            disabled={busy}
            onClick={remove}
          >
            delete
          </button>
        )}
      </div>
    </form>
  )
}
