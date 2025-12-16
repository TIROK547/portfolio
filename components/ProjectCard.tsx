import TechIcon from './TechIcon';

interface Project {
  name: string;
  description: string;
  stack: string[];
  github: string;
  status?: 'active' | 'archived' | 'wip';
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'text-terminal-text-dark',
    archived: 'text-terminal-accent-cyan',
    wip: 'text-terminal-accent-red',
  };

  const statusLabels = {
    active: 'RUNNING',
    archived: 'STOPPED',
    wip: 'STARTING',
  };

  return (
    <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 hover:border-terminal-accent-amber dark:hover:border-terminal-accent-amber transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-terminal-text-light dark:text-terminal-text-dark group-hover:text-terminal-accent-cyan transition-colors">
          <span className="text-terminal-accent-red">$</span> {project.name}
        </h3>
        {project.status && (
          <span className={`text-xs ${statusColors[project.status]} font-mono`}>
            [{statusLabels[project.status]}]
          </span>
        )}
      </div>

      <p className="text-sm text-terminal-text-light/80 dark:text-terminal-text-dark/80 mb-4">
        {project.description}
      </p>

      <div className="mb-4">
        <div className="text-xs text-terminal-accent-cyan mb-2">stack:</div>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-1.5"
            >
              <TechIcon name={tech} size={14} />
              {tech}
            </span>
          ))}
        </div>
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
      >
        <span className="text-terminal-accent-red">→</span>
        view on github
      </a>
    </div>
  );
}
