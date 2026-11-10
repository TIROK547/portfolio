import { contentMetadata, siteUrl, absoluteUrl, PERSON_ID, WEBSITE_ID, jsonLd, breadcrumbSchema } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { getProject, getProjectBySlug } from '@/lib/db'
import { makeExcerpt } from '@/lib/slug'
import Markdown from '@/components/Markdown'
import TechIcon from '@/components/TechIcon'
import ProjectGallery from '@/components/ProjectGallery'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ lang: string; id: string }> }
function publishedProject(id: string) {
  const project = /^\d+$/.test(id) ? getProject(Number(id)) : getProjectBySlug(id)
  if (!project || project.visibility !== 'published') notFound()
  return project
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params
  const p = publishedProject(id)
  return contentMetadata(p.name, p.summary || makeExcerpt(p.description), siteUrl(lang, 'projects', p.slug), p.images[0]?.url)
}
export default async function ProjectPage({ params }: Props) {
  const { lang, id } = await params
  const project = publishedProject(id)
  if (id !== project.slug) permanentRedirect(siteUrl(lang, 'projects', project.slug))
  const url = siteUrl(lang, 'projects', project.slug)
  const workId = `${url}#project`
  const graph = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: project.name,
        isPartOf: { '@id': WEBSITE_ID }, mainEntity: { '@id': workId } },
      { '@type': project.github ? 'SoftwareSourceCode' : 'CreativeWork', '@id': workId,
        name: project.name, url, description: project.summary || makeExcerpt(project.description),
        contributor: { '@id': PERSON_ID }, keywords: project.stack,
        ...(project.github ? { codeRepository: project.github } : {}),
        ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
        ...(project.images.length ? { image: project.images.map(image => absoluteUrl(image.url)) } : {}) },
    ],
  }
  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([
        { name: 'Home', url: siteUrl(lang) }, { name: 'Projects', url: siteUrl(lang, 'projects') }, { name: project.name, url },
      ])) }} />
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
