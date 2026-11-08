'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TerminalSelect from './TerminalSelect'

interface Facet {
  value: string
  label: string
  count: number
}

/** Project-style search controls backed by the paginated blog URL. */
export default function BlogFilters({
  base,
  categories,
  tags,
  initialQuery,
  resultCount,
}: {
  base: string
  categories: Facet[]
  tags: Facet[]
  initialQuery: string
  resultCount: number
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
    router.push(s ? `${base}?${s}` : base, { scroll: false })
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

  function select(key: 'category' | 'tag', value: string) {
    cancelPending()
    if (value && value === searchParams.getAll(key).join(',')) return
    const next = new URLSearchParams(searchParams.toString())
    next.delete('page')
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    next.delete(key)
    if (value) next.set(key, value)
    navigate(next)
  }

  function clearAll() {
    cancelPending()
    setQ('')
    router.push(base, { scroll: false })
  }

  // Keep existing multi-filter links readable until the visitor chooses a new value.
  function options(facets: Facet[], selected: Set<string>, allLabel: string) {
    const values = [...selected]
    return [
      { value: '', label: allLabel },
      ...(values.length > 1 ? [{ value: values.join(','), label: values.join(', ') }] : []),
      ...values.filter((value) => !facets.some((facet) => facet.value === value))
        .map((value) => ({ value, label: value })),
      ...facets.map((facet) => ({ value: facet.value, label: `${facet.label} (${facet.count})` })),
    ]
  }

  const hasFilters = selectedCategories.size > 0 || selectedTags.size > 0 || q.length > 0

  return (
    <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 mb-8 space-y-4">
      <div className="grid sm:grid-cols-[minmax(0,1fr)_11rem_14rem] gap-3">
        <label className="text-xs space-y-2">
          <span className="block opacity-60">find a post</span>
          <input
            type="search"
            value={q}
            onChange={(e) => search(e.target.value)}
            placeholder="Search title, excerpt, content…"
            className="w-full bg-transparent border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-terminal-accent-cyan"
          />
        </label>
        <TerminalSelect
          label="category"
          value={[...selectedCategories].join(',')}
          onChange={(value) => select('category', value)}
          options={options(categories, selectedCategories, 'all categories')}
        />
        <TerminalSelect
          label="tag"
          value={[...selectedTags].join(',')}
          onChange={(value) => select('tag', value)}
          options={options(tags, selectedTags, 'all tags')}
        />
      </div>
      <div className="flex justify-between gap-3 text-xs">
        <span aria-live="polite" className="opacity-60">
          {resultCount} {resultCount === 1 ? 'post' : 'posts'} on this page
        </span>
        {hasFilters && (
          <button onClick={clearAll} className="text-terminal-accent-cyan">
            clear filters ×
          </button>
        )}
      </div>
    </div>
  )
}
