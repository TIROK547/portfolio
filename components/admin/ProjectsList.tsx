'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/db'

/** Reorderable list of projects (drag & drop). Order is saved to the server on drop. */
export default function ProjectsList({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dragIndex = useRef<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  async function save(order: Project[]) {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/projects/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: order.map((p) => p.id) }),
    }).catch(() => null)
    if (!res?.ok) setError('could not save the new order')
    setSaving(false)
  }

  function onDrop(dropIndex: number) {
    const from = dragIndex.current
    dragIndex.current = null
    setOverIndex(null)
    if (from === null || from === dropIndex) return
    const next = [...projects]
    const [moved] = next.splice(from, 1)
    next.splice(dropIndex, 0, moved)
    setProjects(next)
    save(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-terminal-text-dark/50">
        <span>drag rows by the handle to reorder</span>
        {saving && <span className="text-terminal-accent-cyan">saving…</span>}
      </div>
      {error && <p className="text-xs text-terminal-accent-red mb-2">{error}</p>}
      <ul className="divide-y divide-terminal-text-dark/10 border border-terminal-text-dark/20">
        {projects.map((p, index) => (
          <li
            key={p.id}
            onDragOver={(e) => {
              e.preventDefault()
              if (overIndex !== index) setOverIndex(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              onDrop(index)
            }}
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors ${
              overIndex === index ? 'bg-terminal-accent-cyan/10' : ''
            }`}
          >
            <span
              draggable
              onDragStart={() => {
                dragIndex.current = index
              }}
              onDragEnd={() => {
                dragIndex.current = null
                setOverIndex(null)
              }}
              title="drag to reorder"
              className="cursor-grab active:cursor-grabbing text-terminal-text-dark/40 hover:text-terminal-accent-cyan select-none px-1"
            >
              ⠿
            </span>
            <span className="text-xs w-6 text-terminal-text-dark/50">{index + 1}</span>
            <Link href={`/projects/${p.id}`} className="flex-1 min-w-[10rem] hover:text-terminal-accent-cyan transition-colors">
              {p.name}
            </Link>
            {p.featured && <span className="text-xs text-terminal-accent-magenta">[home]</span>}
            <span className="text-xs text-terminal-text-dark/60">{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
