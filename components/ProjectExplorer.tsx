'use client'
import { useState } from 'react'
import type { Project } from '@/lib/db'
import ProjectCard from './ProjectCard'

export default function ProjectExplorer({
  projects,
  locale,
  initialStack = '',
}: {
  projects: Project[]
  locale: string
  initialStack?: string
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [stack, setStack] = useState(initialStack)
  const technologies = [...new Set(projects.flatMap((p) => p.stack))].sort()
  const filtered = projects.filter(
    (p) =>
      (!status || p.status === status) &&
      (!stack || p.stack.includes(stack)) &&
      `${p.name} ${p.summary} ${p.description} ${p.stack.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  )
  return (
    <>
      <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 mb-8 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
          <label className="text-xs space-y-2">
            <span className="block opacity-60">find a project</span>
            <input
              type="search"
              className="w-full bg-transparent border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-terminal-accent-cyan"
              placeholder="Search name, description, stack…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="text-xs space-y-2">
            <span className="block opacity-60">status</span>
            <select
              className="w-full bg-transparent border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-terminal-accent-cyan"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">all statuses</option>
              <option value="active">active</option>
              <option value="wip">in progress</option>
              <option value="archived">archived</option>
              <option value="abandoned">abandoned</option>
            </select>
          </label>
          <label className="text-xs space-y-2">
            <span className="block opacity-60">technology</span>
            <select
              className="w-full bg-transparent border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-3 py-2 text-sm focus:outline-none focus:border-terminal-accent-cyan"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
            >
              <option value="">all technologies</option>
              {technologies.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-between text-xs">
          <span aria-live="polite" className="opacity-60">
            {filtered.length} / {projects.length} projects
          </span>
          {(query || status || stack) && (
            <button
              className="text-terminal-accent-cyan"
              onClick={() => {
                setQuery('')
                setStatus('')
                setStack('')
              }}
            >
              clear filters ×
            </button>
          )}
        </div>
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-12 text-center opacity-60">
          No projects match these filters.
        </p>
      )}
    </>
  )
}
