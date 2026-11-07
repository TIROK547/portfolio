import { pageMetadata, SITE_URL, jsonLd } from '@/lib/seo'
import Hero from '@/components/Hero'
import TechIcon from '@/components/TechIcon'
import { makeExcerpt } from '@/lib/slug'
import { formatDate } from '@/lib/format'
import Link from 'next/link'
import { getSettings, listPosts, listProjects } from '@/lib/db'
import { ageFrom, bioParagraphs } from '@/lib/settings'

// Projects and posts live in SQLite, so render per request instead of at build time.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return pageMetadata('', lang, '')
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const fa = lang === 'fa'
  const projects = listProjects({ publishedOnly: true })
  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 4)
  const selectedProjects = featuredProjects.length
    ? featuredProjects
    : projects.slice(0, 4)
  const latestPosts = listPosts({ publishedOnly: true, limit: 3 })
  const { profile, contact, stack } = getSettings()
  const websiteJsonLd = {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: `${profile.name} Portfolio`, url: SITE_URL,
  }
  const age = ageFrom(profile.birthDate)
  const intro = bioParagraphs(profile.bio, age)[0] ?? ''
  const border =
    'border-terminal-text-light/15 dark:border-terminal-text-dark/15'
  const muted = 'text-terminal-text-light/70 dark:text-terminal-text-dark/70'
  const link =
    'inline-flex items-center gap-2 text-sm text-terminal-accent-cyan hover:text-terminal-accent-yellow transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-terminal-accent-cyan'

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }}
      />
      <Hero
        info={{
          name: profile.name,
          alias: profile.alias,
          role: profile.role,
          location: profile.location,
          age,
        }}
        stack={stack}
        locale={lang}
      />

      <div className="max-w-6xl mx-auto px-4 xl:px-0">
        <nav
          aria-label={fa ? 'بخش‌های صفحه' : 'On this page'}
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 border-y ${border} py-4 text-xs`}
        >
          <span className={`me-auto ${muted}`} aria-hidden="true">
            ~/portfolio
          </span>
          <a href="#work" className="hover:text-terminal-accent-cyan">
            <span className="text-terminal-accent-magenta">01</span>{' '}
            {fa ? 'پروژه‌ها' : 'work'}
          </a>
          <a href="#about" className="hover:text-terminal-accent-cyan">
            <span className="text-terminal-accent-magenta">02</span>{' '}
            {fa ? 'درباره' : 'about'}
          </a>
          <a href="#journal" className="hover:text-terminal-accent-cyan">
            <span className="text-terminal-accent-magenta">03</span>{' '}
            {fa ? 'نوشته‌ها' : 'journal'}
          </a>
          <a href="#connect" className="hover:text-terminal-accent-cyan">
            <span className="text-terminal-accent-magenta">04</span>{' '}
            {fa ? 'تماس' : 'contact'}
          </a>
        </nav>

        <section
          id="work"
          aria-labelledby="work-heading"
          className="scroll-mt-24 py-16 sm:py-24"
        >
          <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)] gap-8 lg:gap-16">
            <div>
              <p className={`text-xs mb-4 ${muted}`}>
                <span className="text-terminal-accent-red">$</span> ls
                ./projects --featured
              </p>
              <h2
                id="work-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4"
              >
                {fa ? 'پروژه‌های منتخب' : 'Selected work'}
                <span className="text-terminal-accent-cyan">.</span>
              </h2>
              <p className={`text-sm leading-7 mb-6 ${muted}`}>
                {fa
                  ? 'از برنامه‌های وب تا ابزارهای سیستمی و زیرساخت شبکه.'
                  : 'Web applications, systems experiments, and the infrastructure that connects them.'}
              </p>
              <Link href={`/${lang}/projects`} className={link}>
                {fa ? 'همه پروژه‌ها' : 'all projects'}{' '}
                <span className={muted}>
                  [{String(projects.length).padStart(2, '0')}]
                </span>{' '}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className={`border-t ${border} min-w-0`}>
              {selectedProjects.map((project, index) => (
                <article
                  key={project.id}
                  className={`group border-b ${border} py-7 sm:py-8 transition-colors hover:bg-terminal-accent-cyan/[0.03]`}
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <span
                      aria-hidden="true"
                      className={`pt-1 text-xs tabular-nums ${muted}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                          <Link
                            href={`/${lang}/projects/${project.id}`}
                            className="hover:text-terminal-accent-cyan transition-colors"
                          >
                            {project.name}
                          </Link>
                        </h3>
                        <span
                          className={`text-xs whitespace-nowrap ${project.status === 'active' ? 'text-terminal-accent-green' : project.status === 'wip' ? 'text-terminal-accent-yellow' : muted}`}
                        >
                          <span aria-hidden="true">● </span>
                          {project.status === 'wip'
                            ? fa
                              ? 'در حال توسعه'
                              : 'in progress'
                            : project.status}
                        </span>
                      </div>
                      <p
                        dir="auto"
                        className="text-sm leading-7 text-terminal-text-light/75 dark:text-terminal-text-dark/75 max-w-2xl"
                      >
                        {project.summary || makeExcerpt(project.description)}
                      </p>
                      <div
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs ${muted}`}
                      >
                        {project.stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1.5"
                          >
                            <TechIcon name={tech} size={12} />
                            {tech}
                          </span>
                        ))}
                        {project.stack.length > 4 && (
                          <span>+{project.stack.length - 4}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-xs">
                        <Link
                          href={`/${lang}/projects/${project.id}`}
                          className="text-terminal-accent-cyan hover:text-terminal-accent-yellow"
                        >
                          {fa ? 'جزئیات پروژه' : 'explore project'}{' '}
                          <span aria-hidden="true">→</span>
                        </Link>
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${muted} hover:text-terminal-accent-cyan`}
                          >
                            github ↗
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${muted} hover:text-terminal-accent-cyan`}
                          >
                            {fa ? 'مشاهده آنلاین' : 'live'} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {!selectedProjects.length && (
                <p className={`py-8 text-sm ${muted}`}>
                  {fa
                    ? 'پروژه‌ها به‌زودی اضافه می‌شوند.'
                    : 'New work will appear here soon.'}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className={`scroll-mt-24 border-y ${border} py-12 sm:py-16 grid lg:grid-cols-2 gap-12 lg:gap-20`}
        >
          <div>
            <p className={`text-xs mb-5 ${muted}`}>
              <span className="text-terminal-accent-red">$</span> cat ./about.md
            </p>
            <h2
              id="about-heading"
              className="text-2xl font-semibold tracking-tight mb-5"
            >
              {fa ? 'پشتِ کد' : 'Behind the code'}
              <span className="text-terminal-accent-magenta">_</span>
            </h2>
            <p
              dir="auto"
              className="text-sm sm:text-base leading-8 text-terminal-text-light/75 dark:text-terminal-text-dark/75"
            >
              {intro}
            </p>
            <Link href={`/${lang}/about`} className={`${link} mt-7`}>
              {fa ? 'بیشتر درباره من' : 'more about me'}{' '}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div>
            <h3 className={`text-xs mb-5 ${muted}`}>
              <span className="text-terminal-accent-blue">[</span>{' '}
              {fa ? 'ابزارهای من' : 'toolbox'}{' '}
              <span className="text-terminal-accent-blue">]</span>
            </h3>
            <div className="space-y-6">
              {stack.map((group) => (
                <div
                  key={group.category}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] gap-4 text-xs leading-6"
                >
                  <span className="text-terminal-accent-blue break-words">
                    {group.category}/
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {group.items.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2"
                      >
                        <TechIcon name={tech} size={14} />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="journal"
          aria-labelledby="journal-heading"
          className="scroll-mt-24 py-16 sm:py-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
            <div>
              <p className={`text-xs mb-4 ${muted}`}>
                <span className="text-terminal-accent-red">$</span> tail -n 3
                ./journal
              </p>
              <h2
                id="journal-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight"
              >
                {fa ? 'آخرین نوشته‌ها' : 'From the journal'}
                <span className="text-terminal-accent-blue">.</span>
              </h2>
            </div>
            <Link href={`/${lang}/blog`} className={link}>
              {fa ? 'همه نوشته‌ها' : 'all entries'}{' '}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className={`border-t ${border}`}>
            {latestPosts.map((post) => (
              <article
                key={post.id}
                className={`grid sm:grid-cols-[10rem_minmax(0,1fr)_auto] gap-3 sm:gap-8 border-b ${border} py-6`}
              >
                <div className={`text-xs leading-6 ${muted}`}>
                  <time dateTime={post.publishedAt ?? post.createdAt}>
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </time>
                  <p>
                    {post.readingMinutes} {fa ? 'دقیقه مطالعه' : 'min read'}
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 dir="auto" className="font-semibold text-lg mb-2">
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      className="hover:text-terminal-accent-cyan"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p
                    dir="auto"
                    className={`text-sm leading-7 line-clamp-2 ${muted}`}
                  >
                    {post.excerpt}
                  </p>
                </div>
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  aria-label={`${fa ? 'مطالعه' : 'Read'} ${post.title}`}
                  className="text-terminal-accent-cyan hover:text-terminal-accent-yellow self-start"
                >
                  ↗
                </Link>
              </article>
            ))}
            {!latestPosts.length && (
              <div
                className={`border-b ${border} py-8 flex flex-wrap items-center gap-3 text-sm ${muted}`}
              >
                <span
                  className="text-terminal-accent-yellow"
                  aria-hidden="true"
                >
                  #
                </span>
                {fa
                  ? 'هنوز نوشته‌ای منتشر نشده است. به‌زودی یادداشت‌هایی از مسیر ساختن.'
                  : 'No entries yet. Notes from the workbench, coming soon.'}
              </div>
            )}
          </div>
        </section>

        <section
          id="connect"
          aria-labelledby="contact-heading"
          className={`scroll-mt-24 border-t ${border} pt-12 pb-16 sm:pb-24`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl min-w-0">
              <p className={`text-xs mb-5 ${muted}`}>
                <span className="text-terminal-accent-red">$</span> ./connect
              </p>
              <h2
                id="contact-heading"
                className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-5"
              >
                {fa ? 'چیزی در ذهن دارید؟' : 'Have something in mind?'}
                <span className="text-terminal-accent-green" aria-hidden="true">
                  {' '}
                  _
                </span>
              </h2>
              <p className={`text-sm leading-7 ${muted}`}>{contact.status}</p>
              <a
                href={`mailto:${contact.email}`}
                className="inline-block mt-5 text-base sm:text-xl text-terminal-accent-yellow hover:text-terminal-accent-cyan break-all transition-colors"
              >
                {contact.email} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {contact.github && (
                <a
                  href={`https://github.com/${contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-terminal-accent-cyan"
                >
                  github ↗
                </a>
              )}
              {contact.telegram && (
                <a
                  href={`https://t.me/${contact.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-terminal-accent-cyan"
                >
                  telegram ↗
                </a>
              )}
              <Link href={`/${lang}/contact`} className={link}>
                {fa ? 'راه‌های ارتباط' : 'contact details'} →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
