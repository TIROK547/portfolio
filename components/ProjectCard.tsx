import Link from 'next/link'
import TechIcon from './TechIcon'
import type { Project } from '@/lib/db'
import { makeExcerpt } from '@/lib/slug'

export default function ProjectCard({
  project,
  locale = 'en',
}: {
  project: Project
  locale?: string
}) {
  const cover = project.images[0]
  const href = `/${locale}/projects/${project.id}`
  return (
    <article className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan/40 dark:hover:border-terminal-accent-cyan/40 transition-colors flex flex-col overflow-hidden group">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="block border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-terminal-accent-cyan/5"
      >
        {cover ? (
          <img
            src={cover.url}
            alt={cover.alt || project.name}
            loading="lazy"
            className={`w-full h-52 ${cover.kind === 'logo' ? 'object-contain p-8' : 'object-cover object-top'}`}
          />
        ) : (
          <div className="h-40 p-6 flex flex-col justify-between" aria-hidden>
            <span className="text-xs opacity-40">
              ~/projects/{String(project.id).padStart(2, '0')}
            </span>
            <span className="text-4xl text-terminal-accent-cyan/60 font-bold">
              {'{ '}
              {project.name.slice(0, 2).toUpperCase()}
              {' }'}
            </span>
            <span className="text-xs opacity-40">
              {project.stack.slice(0, 3).join(' / ')}
            </span>
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={
              project.status === 'active'
                ? 'text-terminal-accent-green'
                : project.status === 'wip'
                  ? 'text-terminal-accent-yellow'
                  : 'opacity-60'
            }
          >
            ● {project.status === 'wip' ? 'in progress' : project.status}
          </span>
          {project.featured && (
            <span className="ml-auto text-terminal-accent-magenta">
              ★ featured
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold group-hover:text-terminal-accent-cyan">
          <Link href={href}>
            <span className="text-terminal-accent-red">$ </span>
            {project.name}
          </Link>
        </h2>
        <p className="text-sm opacity-80 leading-relaxed line-clamp-3">
          {project.summary || makeExcerpt(project.description)}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 flex items-center gap-1.5"
            >
              <TechIcon name={tech} size={14} />
              {tech}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 pt-4 mt-auto">
          <Link
            href={href}
            className="text-terminal-accent-cyan hover:underline"
          >
            explore project →
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terminal-accent-green"
            >
              view live ↗
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terminal-accent-green"
            >
              github ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
