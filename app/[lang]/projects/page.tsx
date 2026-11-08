import { pageMetadata, pageSchema, jsonLd, siteUrl } from '@/lib/seo'
import ProjectExplorer from '@/components/ProjectExplorer';
import BackLink from '@/components/BackLink';
import { listProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ stack?: string | string[] }> }) {
  const { lang } = await params
  const { stack } = await searchParams
  return { ...pageMetadata('Projects', lang, 'projects'), ...(stack ? { robots: { index: false, follow: true } } : {}) }
}

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ stack?: string | string[] }> }) {
  const { lang } = await params;
  const { stack } = await searchParams;
  const projects = listProjects({ publishedOnly: true });

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(pageSchema('CollectionPage', 'Projects', siteUrl(lang, 'projects'))) }} />
      <div className="max-w-6xl mx-auto">
        <BackLink fallback={`/${lang}`} className="inline-block mb-6" />
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span aria-hidden="true" className="text-terminal-accent-red">$ </span>Projects
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-4" />
          <p className="text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            total {projects.length} projects
          </p>
        </div>

        <ProjectExplorer projects={projects} locale={lang} initialStack={Array.isArray(stack) ? stack : stack ? [stack] : []} key={JSON.stringify(stack ?? [])} />
      </div>
    </div>
  );
}
