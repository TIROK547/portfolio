import Hero from '@/components/Hero';
import StackDisplay from '@/components/StackDisplay';
import ProjectCard from '@/components/ProjectCard';
import Link from 'next/link';

export default function HomePage() {
const featuredProjects = [
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
];


  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <Hero />

      {/* About Preview */}
      <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">whoami</span>
          </h2>
          <div className="max-w-3xl">
            <p className="text-terminal-text-light/80 dark:text-terminal-text-dark/80 mb-4 leading-relaxed">
              I'm Alireza Ghotbi, a 19-year-old full-stack developer from Iran. I build web applications with a focus on clean architecture and modern technologies. My journey in programming started with curiosity and evolved into a passion for creating efficient, scalable solutions.
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
        <StackDisplay />
      </div>

      {/* Featured Projects */}
      <section className="py-12 sm:py-16 px-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span> <span className="text-terminal-accent-cyan">-la</span> <span className="text-terminal-accent-blue">./projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
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
                href="mailto:dev@tirok.ir"
                className="text-terminal-accent-yellow hover:text-terminal-accent-blue transition-colors"
              >
                dev@tirok.ir
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-terminal-accent-cyan min-w-[120px]">telegram:</span>
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
              <span className="text-terminal-accent-cyan min-w-[120px]">github:</span>
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
