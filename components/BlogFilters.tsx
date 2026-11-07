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
  const queryString = searchParams.toString()
  const [q, setQ] = useState(initialQuery)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedCategories = new Set(searchParams.getAll('category'))
  const selectedTags = new Set(searchParams.getAll('tag'))

  function navigate(next: URLSearchParams) {
    const s = next.toString()
    router.push(s ? `${base}?${s}` : base)
  }

  function cancelPending() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  useEffect(() => {
    cancelPending()
    // URL navigation (including Back/Forward) is the source of truth.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(initialQuery)
  }, [initialQuery, queryString])
  useEffect(() => () => cancelPending(), [])

  function search(value: string) {
    setQ(value)
    cancelPending()
    timer.current = setTimeout(() => {
      const next = new URLSearchParams(window.location.search)
      next.delete('page')
      if (value.trim()) next.set('q', value.trim())
      else next.delete('q')
      router.replace(`${base}${next.size ? `?${next}` : ''}`, { scroll: false })
    }, 350)
  }

  function toggle(key: 'category' | 'tag', value: string) {
    cancelPending()
    const next = new URLSearchParams(searchParams.toString())
    next.delete('page')
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    const current = next.getAll(key)
    next.delete(key)
    const set = new Set(current)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    set.forEach((v) => next.append(key, v))
    navigate(next)
  }

  function clearAll() {
    cancelPending()
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
        <label htmlFor="blog-search" className="text-sm text-terminal-accent-cyan min-w-[80px]">search:</label>
        <input
          id="blog-search"
          type="search"
          value={q}
          onChange={(e) => search(e.target.value)}
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
            <button aria-pressed={selectedCategories.has(c.value)} key={c.value} onClick={() => toggle('category', c.value)} className={chip(selectedCategories.has(c.value))}>
              {c.label} ({c.count})
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-terminal-accent-cyan min-w-[80px]">tags:</span>
          {tags.map((t) => (
            <button aria-pressed={selectedTags.has(t.value)} key={t.value} onClick={() => toggle('tag', t.value)} className={chip(selectedTags.has(t.value))}>
              #{t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
