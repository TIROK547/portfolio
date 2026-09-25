import Hero from '@/components/Hero';
import StackDisplay from '@/components/StackDisplay';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { getSettings, listPosts, listProjects } from '@/lib/db';
import { ageFrom, bioParagraphs } from '@/lib/settings';

// Projects and posts live in SQLite, so render per request instead of at build time.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const featuredProjects = listProjects({ featuredOnly: true });
  const latestPosts = listPosts({ publishedOnly: true, limit: 3 });
  const { profile, contact, stack } = getSettings();
  const age = ageFrom(profile.birthDate);
  const intro = bioParagraphs(profile.bio, age)[0] ?? '';

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <Hero info={{ name: profile.name, alias: profile.alias, role: profile.role, location: profile.location, age }} stack={stack} />

      {/* About Preview */}
      <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">whoami</span>
          </h2>
          <div className="max-w-3xl">
            <p className="text-terminal-text-light/80 dark:text-terminal-text-dark/80 mb-4 leading-relaxed">
              {intro}
            </p>
            <Link
              href="/en/about"
              className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
            >
              <span className="text-terminal-accent-magenta">→</span>
              view more
            </Link>
          </div>
        </div>
      </section>

      {/* Stack Display */}
      <div className="border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <StackDisplay stack={stack} />
      </div>

      {/* Featured Projects */}
      <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span> <span className="text-terminal-accent-cyan">-la</span> <span className="text-terminal-accent-blue">./projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Link
            href="/en/projects"
            className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
          >
            <span className="text-terminal-accent-magenta">→</span>
            view more
          </Link>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">tail</span> <span className="text-terminal-accent-cyan">-n 3</span> <span className="text-terminal-accent-blue">./blog</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} locale="en" />
              ))}
            </div>
            <Link
              href="/en/blog"
              className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
            >
              <span className="text-terminal-accent-magenta">→</span>
              view more
            </Link>
          </div>
        </section>
      )}

      {/* Contact Preview */}
      <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">cat</span> <span className="text-terminal-accent-blue">./contact.txt</span>
          </h2>
          <div className="space-y-3 text-sm sm:text-base mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-terminal-accent-cyan min-w-[120px]">email:</span>
              <a
                href={`mailto:${contact.email}`}
                className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
              >
                {contact.email}
              </a>
            </div>
            {contact.telegram && (
              <div className="flex flex-wrap gap-2">
                <span className="text-terminal-accent-cyan min-w-[120px]">telegram:</span>
                <a
                  href={`https://t.me/${contact.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
                >
                  @{contact.telegram}
                </a>
              </div>
            )}
            {contact.github && (
              <div className="flex flex-wrap gap-2">
                <span className="text-terminal-accent-cyan min-w-[120px]">github:</span>
                <a
                  href={`https://github.com/${contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
                >
                  {contact.github}
                </a>
              </div>
            )}
          </div>
          <Link
            href="/en/contact"
            className="inline-flex items-center gap-2 text-sm hover:text-terminal-accent-blue transition-colors"
          >
            <span className="text-terminal-accent-magenta">→</span>
            <span className="text-terminal-accent-green">view more</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
