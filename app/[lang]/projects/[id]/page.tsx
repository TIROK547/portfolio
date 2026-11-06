import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/db'
import { makeExcerpt } from '@/lib/slug'
import Markdown from '@/components/Markdown'
import TechIcon from '@/components/TechIcon'
import ProjectGallery from '@/components/ProjectGallery'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ lang: string; id: string }> }
function publishedProject(id: string) {
  const project = /^\d+$/.test(id) ? getProject(Number(id)) : null
  if (!project || project.visibility !== 'published') notFound()
  return project
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params
  const p = publishedProject(id)
  return {
    title: p.name,
    description: p.summary || makeExcerpt(p.description),
    alternates: { canonical: `/${lang}/projects/${id}` },
    openGraph: {
      title: p.name,
      description: p.summary || makeExcerpt(p.description),
      ...(p.images[0] ? { images: [p.images[0].url] } : {}),
    },
  }
}
export default async function ProjectPage({ params }: Props) {
  const { lang, id } = await params
  const project = publishedProject(id)
  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <article className="max-w-5xl mx-auto">
        <Link
          href={`/${lang}/projects`}
          className="text-sm text-terminal-accent-cyan hover:underline"
        >
          ← all projects
        </Link>
        <header className="mt-8 border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20 pb-8 space-y-5">
          <div className="text-xs flex gap-4">
            <span className="text-terminal-accent-green">
              ● {project.status === 'wip' ? 'in progress' : project.status}
            </span>
            {project.featured && (
              <span className="text-terminal-accent-magenta">★ featured</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold break-words">
            <span className="text-terminal-accent-red">$ </span>
            {project.name}
          </h1>
          {project.summary && (
            <p className="opacity-70 leading-relaxed max-w-3xl">
              {project.summary}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <Link
                href={`/${lang}/projects?stack=${encodeURIComponent(tech)}`}
                key={tech}
                className="inline-flex items-center gap-2 text-xs border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-3 py-2"
              >
                <TechIcon name={tech} />
                {tech}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-terminal-accent-green/30 text-terminal-accent-green px-4 py-2 text-sm"
              >
                view live ↗
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 px-4 py-2 text-sm"
              >
                view on GitHub ↗
              </a>
            )}
          </div>
        </header>
        <ProjectGallery images={project.images} name={project.name} />
        <section className="max-w-3xl mx-auto py-4 min-w-0 break-words">
          <Markdown>
            {project.description || '*Documentation coming soon.*'}
          </Markdown>
        </section>
      </article>
    </div>
  )
}
