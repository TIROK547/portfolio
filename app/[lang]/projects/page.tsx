import { getTranslations, type Locale } from '@/lib/i18n';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectsPage({ params }: { params: { lang: string } }) {
  const locale = params.lang as Locale;
  const t = getTranslations(locale);

  const projects = [
    {
      name: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform with Django backend and Next.js frontend. Features include real-time inventory management, JWT authentication, payment gateway integration, and admin dashboard. Built with scalability in mind using Celery for background tasks and Redis for caching.',
      stack: ['Next.js', 'Django', 'PostgreSQL', 'Redis', 'Celery', 'Docker'],
      github: 'https://github.com/tirok547',
      status: 'active' as const,
    },
    {
      name: 'Real-time Chat Application',
      description: 'WebSocket-based chat application built with Django Channels. Supports private messaging, group chats, real-time notifications, and file sharing. Uses Redis as a channel layer for horizontal scaling and PostgreSQL for message persistence.',
      stack: ['Django Channels', 'WebSocket', 'React', 'Redis', 'PostgreSQL'],
      github: 'https://github.com/tirok547',
      status: 'wip' as const,
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-4">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span> <span className="text-terminal-accent-cyan">-la</span> <span className="text-terminal-accent-blue">~/{t.projects.title}/</span>
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-4" />
          <p className="text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            total {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} translations={t} />
          ))}
        </div>

        {/* Add More Section */}
        <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6 border-dashed">
          <div className="text-center">
            <p className="text-terminal-text-light/60 dark:text-terminal-text-dark/60 mb-2">
              <span className="text-terminal-accent-cyan">[INFO]</span> More projects coming soon...
            </p>
            <p className="text-xs text-terminal-text-light/40 dark:text-terminal-text-dark/40">
              Currently working on new features and documenting existing work.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 pt-6">
          <p className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            <span className="text-terminal-accent-red">$</span> To add more projects, edit this file and add new entries to the projects array.
          </p>
        </div>
      </div>
    </div>
  );
}
