import Link from 'next/link'
import { listProjects } from '@/lib/db'

export default function ProjectsAdminPage() {
  const projects = listProjects()
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          <span className="text-terminal-accent-red">$</span> ls projects/
        </h1>
        <Link href="/projects/new" className="adm-btn adm-btn-primary">new project</Link>
      </div>
      <ul className="divide-y divide-terminal-text-dark/10 border border-terminal-text-dark/20">
        {projects.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <span className="text-xs w-8 text-terminal-text-dark/50">{p.sortOrder}</span>
            <Link href={`/projects/${p.id}`} className="flex-1 min-w-[10rem] hover:text-terminal-accent-cyan transition-colors">
              {p.name}
            </Link>
            {p.featured && <span className="text-xs text-terminal-accent-magenta">[home]</span>}
            <span className="text-xs text-terminal-text-dark/60">{p.status}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
