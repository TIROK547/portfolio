import TechIcon from './TechIcon';

export default function StackDisplay() {
  const stack = {
    frontend: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React'],
    backend: ['Django', 'Django REST Framework', 'JWT Auth', 'PostgreSQL', 'Celery', 'Redis', 'RabbitMQ', 'Channels'],
    devops: ['Docker', 'Nginx', 'Cloudflared', 'systemd', 'Arch Linux'],
    extras: ['Telegram Bots', 'WebSocket'],
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6 terminal-window">
          {/* Window Title */}
          <div className="absolute top-0 left-0 right-0 h-6 border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20 flex items-center px-2 gap-2">
            <span className="text-xs text-terminal-accent-purple">●</span>
            <span className="text-xs text-terminal-accent-blue">●</span>
            <span className="text-xs text-terminal-text-dark">●</span>
            <span className="text-xs ml-2">stack_config.conf</span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-6">
              <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">cat</span> <span className="text-terminal-accent-blue">stack_overview</span>
            </h2>

            <div className="space-y-6 text-sm sm:text-base font-mono">
              {/* Frontend */}
              <div>
                <div className="text-terminal-accent-blue font-semibold mb-2">
                  [FRONTEND]
                </div>
                <div className="pl-4 space-y-1">
                  {stack.frontend.map((tech, index) => (
                    <div key={index} className="text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-2">
                      <span className="text-terminal-accent-purple">→</span>
                      <TechIcon name={tech} size={20} />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div>
                <div className="text-terminal-accent-blue font-semibold mb-2">
                  [BACKEND]
                </div>
                <div className="pl-4 space-y-1">
                  {stack.backend.map((tech, index) => (
                    <div key={index} className="text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-2">
                      <span className="text-terminal-accent-purple">→</span>
                      <TechIcon name={tech} size={20} />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DevOps */}
              <div>
                <div className="text-terminal-accent-blue font-semibold mb-2">
                  [DEVOPS]
                </div>
                <div className="pl-4 space-y-1">
                  {stack.devops.map((tech, index) => (
                    <div key={index} className="text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-2">
                      <span className="text-terminal-accent-purple">→</span>
                      <TechIcon name={tech} size={20} />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <div className="text-terminal-accent-blue font-semibold mb-2">
                  [EXTRAS]
                </div>
                <div className="pl-4 space-y-1">
                  {stack.extras.map((tech, index) => (
                    <div key={index} className="text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-2">
                      <span className="text-terminal-accent-purple">→</span>
                      <TechIcon name={tech} size={20} />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
                <span className="text-terminal-text-light/60 dark:text-terminal-text-dark/60 text-xs">
                  # Total packages: {Object.values(stack).flat().length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
