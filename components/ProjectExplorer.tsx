'use client'
import { useState } from 'react'
import type { Project } from '@/lib/db'
import ProjectCard from './ProjectCard'
import TerminalSelect from './TerminalSelect'

export default function ProjectExplorer({
  projects,
  locale,
  initialStack = [],
}: {
  projects: Project[]
  locale: string
  initialStack?: string[]
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [stack, setStack] = useState(initialStack)
  const technologies = [...new Set(projects.flatMap((p) => p.stack))].sort()
  const filtered = projects.filter(
    (p) =>
      (!status || p.status === status) &&
      (!stack.length || stack.some((technology) => p.stack.includes(technology))) &&
      `${p.name} ${p.summary} ${p.description} ${p.stack.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  )
  return (
    <>
      <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 mb-8 space-y-4">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_11rem_14rem] gap-3">
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
          <TerminalSelect
            label="status"
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'all statuses' },
              { value: 'active', label: 'active' },
              { value: 'wip', label: 'in progress' },
              { value: 'archived', label: 'archived' },
              { value: 'abandoned', label: 'abandoned' },
            ]}
          />
          <TerminalSelect
            label="technologies"
            multiple
            searchable
            placeholder="Search technologies…"
            value={stack}
            onChange={setStack}
            options={technologies.map((tech) => ({ value: tech, label: tech }))}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span aria-live="polite" className="opacity-60">
            {filtered.length} / {projects.length} projects
          </span>
          {(query || status || stack.length > 0) && (
            <button
              className="text-terminal-accent-cyan"
              onClick={() => {
                setQuery('')
                setStatus('')
                setStack([])
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
