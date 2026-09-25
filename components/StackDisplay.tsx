import TechIcon from './TechIcon';
import type { StackGroup } from '@/lib/settings';

export default function StackDisplay({ stack }: { stack: StackGroup[] }) {
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
              {stack.map((group) => (
                <div key={group.category}>
                  <div className="text-terminal-accent-blue font-semibold mb-2">
                    [{group.category.toUpperCase()}]
                  </div>
                  <div className="pl-4 space-y-1">
                    {group.items.map((tech, index) => (
                      <div key={index} className="text-terminal-text-dark flex items-center gap-2">
                        <span className="text-terminal-accent-purple">→</span>
                        <TechIcon name={tech} size={20} />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
                <span className="text-terminal-text-light/60 dark:text-terminal-text-dark/60 text-xs">
                  # Total packages: {stack.reduce((n, g) => n + g.items.length, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
