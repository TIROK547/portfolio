import ProjectCard from '@/components/ProjectCard';
import BackLink from '@/components/BackLink';
import { listProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const projects = listProjects();

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <BackLink fallback={`/${lang}`} className="inline-block mb-6" />
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-4">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span> <span className="text-terminal-accent-cyan">-la</span> <span className="text-terminal-accent-blue">~/projects/</span>
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-4" />
          <p className="text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            total {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
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
      </div>
    </div>
  );
}
