import { getTranslations, type Locale } from '@/lib/i18n';
import Hero from '@/components/Hero';
import StackDisplay from '@/components/StackDisplay';
import ProjectCard from '@/components/ProjectCard';
import Link from 'next/link';

export default function HomePage({ params }: { params: { lang: string } }) {
  const locale = params.lang as Locale;
  const t = getTranslations(locale);

  const featuredProjects = [
    {
      name: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform with Django backend and Next.js frontend. Features include real-time inventory, JWT authentication, and payment integration.',
      stack: ['Next.js', 'Django', 'PostgreSQL', 'Redis', 'Celery'],
      github: 'https://github.com/tirok547',
      status: 'active' as const,
    },
    {
      name: 'Real-time Chat Application',
      description: 'WebSocket-based chat application with Django Channels backend. Supports private messaging, group chats, and real-time notifications.',
      stack: ['Django Channels', 'WebSocket', 'React', 'Redis'],
      github: 'https://github.com/tirok547',
      status: 'wip' as const,
    },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <Hero translations={t} />

      {/* About Preview */}
      <section className="py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">whoami</span>
          </h2>
          <div className="max-w-3xl">
            <p className="text-terminal-text-light/80 dark:text-terminal-text-dark/80 mb-4 leading-relaxed">
              {t.about.bio.split('\n\n')[0]}
            </p>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
            >
              <span className="text-terminal-accent-magenta">→</span>
              {t.home.viewMore}
            </Link>
          </div>
        </div>
      </section>

      {/* Stack Display */}
      <div className="border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <StackDisplay translations={t} />
      </div>

      {/* Featured Projects */}
      <section className="py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span> <span className="text-terminal-accent-cyan">-la</span> <span className="text-terminal-accent-blue">./projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} translations={t} />
            ))}
          </div>
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
          >
            <span className="text-terminal-accent-magenta">→</span>
            {t.home.viewMore}
          </Link>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">cat</span> <span className="text-terminal-accent-blue">./contact.txt</span>
          </h2>
          <div className="space-y-3 text-sm sm:text-base mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-terminal-accent-cyan min-w-[120px]">{t.contact.email}:</span>
              <a
                href="mailto:dev@tirok.ir"
                className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
              >
                dev@tirok.ir
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-terminal-accent-cyan min-w-[120px]">{t.contact.telegram}:</span>
              <a
                href="https://t.me/xyaes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
              >
                @xyaes
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-terminal-accent-cyan min-w-[120px]">{t.contact.github}:</span>
              <a
                href="https://github.com/tirok547"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
              >
                tirok547
              </a>
            </div>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 text-sm hover:text-terminal-accent-blue transition-colors"
          >
            <span className="text-terminal-accent-magenta">→</span>
            <span className="text-terminal-accent-green">{t.home.viewMore}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
