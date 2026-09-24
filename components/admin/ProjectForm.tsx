'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/db'

export default function ProjectForm({ initial }: { initial?: Project }) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [stack, setStack] = useState((initial?.stack ?? []).join(', '))
  const [github, setGithub] = useState(initial?.github ?? 'https://github.com/TIROK547/')
  const [status, setStatus] = useState<Project['status']>(initial?.status ?? 'active')
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0))
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch(initial ? `/api/admin/projects/${initial.id}` : '/api/admin/projects', {
      method: initial ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        github,
        status,
        featured,
        stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
      }),
    }).catch(() => null)
    if (res?.ok) {
      router.replace('/projects')
      router.refresh()
      return
    }
    const data = res ? await res.json().catch(() => ({})) : {}
    setError(data.error ?? 'could not reach the server')
    setBusy(false)
  }

  async function remove() {
    if (!initial || !confirm(`Delete "${initial.name}"?`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/projects/${initial.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.replace('/projects')
      router.refresh()
    } else {
      setError('delete failed')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <div>
        <label className="adm-label" htmlFor="name">name</label>
        <input id="name" className="adm-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      </div>
      <div>
        <label className="adm-label" htmlFor="description">description</label>
        <textarea id="description" className="adm-input h-32 resize-y" value={description}
          onChange={(e) => setDescription(e.target.value)} maxLength={2000} required />
      </div>
      <div>
        <label className="adm-label" htmlFor="stack">stack (comma separated)</label>
        <input id="stack" className="adm-input" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="Django, PostgreSQL, Redis" />
      </div>
      <div>
        <label className="adm-label" htmlFor="github">github url</label>
        <input id="github" type="url" className="adm-input" value={github} onChange={(e) => setGithub(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="adm-label" htmlFor="pstatus">status</label>
          <select id="pstatus" className="adm-input" value={status} onChange={(e) => setStatus(e.target.value as Project['status'])}>
            <option value="active">active (running)</option>
            <option value="wip">wip (starting)</option>
            <option value="archived">archived (stopped)</option>
          </select>
        </div>
        <div>
          <label className="adm-label" htmlFor="order">order (lower = first)</label>
          <input id="order" type="number" className="adm-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        show on the home page
      </label>
      {error && <p role="alert" className="text-sm text-terminal-accent-red">{error}</p>}
      <div className="flex gap-3">
        <button className="adm-btn adm-btn-primary" disabled={busy}>{busy ? 'saving…' : 'save'}</button>
        {initial && <button type="button" className="adm-btn adm-btn-danger" onClick={remove} disabled={busy}>delete</button>}
      </div>
    </form>
  )
}
