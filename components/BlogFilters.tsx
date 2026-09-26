'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Facet {
  value: string
  label: string
  count: number
}

/** Search box + multi-select category/tag chips. Reads/writes the URL, page.tsx re-fetches from it. */
export default function BlogFilters({
  base,
  categories,
  tags,
  initialQuery,
}: {
  base: string
  categories: Facet[]
  tags: Facet[]
  initialQuery: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(initialQuery)
  const firstRun = useRef(true)

  const selectedCategories = new Set(searchParams.getAll('category'))
  const selectedTags = new Set(searchParams.getAll('tag'))

  function navigate(next: URLSearchParams) {
    const s = next.toString()
    router.push(s ? `${base}?${s}` : base)
  }

  // Debounced search: types into the box, URL updates ~350ms after the last keystroke.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString())
      if (q.trim()) next.set('q', q.trim())
      else next.delete('q')
      navigate(next)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function toggle(key: 'category' | 'tag', value: string) {
    const next = new URLSearchParams(searchParams.toString())
    const current = next.getAll(key)
    next.delete(key)
    const set = new Set(current)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    set.forEach((v) => next.append(key, v))
    navigate(next)
  }

  function clearAll() {
    setQ('')
    router.push(base)
  }

  const chip = (active: boolean) =>
    `text-xs px-2 py-1 border transition-colors ${
      active
        ? 'border-terminal-accent-cyan text-terminal-accent-cyan bg-terminal-accent-cyan/10'
        : 'border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan'
    }`

  const hasFilters = selectedCategories.size > 0 || selectedTags.size > 0 || q.trim().length > 0

  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-terminal-accent-cyan min-w-[80px]">search:</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="grep posts…"
          className="flex-1 min-w-[10rem] max-w-xs bg-transparent border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-2 py-1 text-sm text-terminal-text-light dark:text-terminal-text-dark placeholder:text-terminal-text-light/30 dark:placeholder:text-terminal-text-dark/30 focus:outline-none focus:border-terminal-accent-cyan"
        />
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-terminal-accent-red hover:text-terminal-accent-red/80">
            clear
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-terminal-accent-cyan min-w-[80px]">categories:</span>
          {categories.map((c) => (
            <button key={c.value} onClick={() => toggle('category', c.value)} className={chip(selectedCategories.has(c.value))}>
              {c.label} ({c.count})
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-terminal-accent-cyan min-w-[80px]">tags:</span>
          {tags.map((t) => (
            <button key={t.value} onClick={() => toggle('tag', t.value)} className={chip(selectedTags.has(t.value))}>
              #{t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
