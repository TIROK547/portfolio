import ProjectCard from '@/components/ProjectCard';

export default function ProjectsPage() {

  const projects = [
  {
    name: 'Os',
    description: 'A Python-based minimal operating system simulation project. This project includes a custom filesystem structure, process handling logic, and foundational components that mimic basic OS behaviors. It demonstrates low-level programming skills and understanding of core operating system concepts through Python scripting and file modeling.',
    stack: ['Python'],
    github: 'https://github.com/TIROK547/Os',
    status: 'wip' as const,
  },
  {
    name: 'Telegram Study Bot',
    description: 'A Telegram bot designed to assist with study tasks and organization. Built with Python, it includes bot integration with a database backend, command handling, and deployment scripts. Useful for automating schedule reminders, task tracking, and other personalized study workflows.',
    stack: ['Python', 'Telegram Bot API'],
    github: 'https://github.com/TIROK547/telegram-study-bot',
    status: 'active' as const,
  },
  {
    name: 'Portfolio Website',
    description: 'A retro terminal-inspired portfolio website showcasing projects and skills. Built with Next.js, TypeScript, React, and Tailwind CSS, the site features bilingual support, theme toggling, responsive design, and terminal CRT aesthetic effects. Designed to present your developer profile in a unique and interactive way.',
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
    github: 'https://github.com/TIROK547/portfolio',
    status: 'active' as const,
  },
];


  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
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
