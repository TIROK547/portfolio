'use client';

import { useEffect, useState } from 'react';
import AsciiArt from './AsciiArt';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setTypingComplete(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const birthDate = new Date('2006-11-14');
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const systemInfo = [
    { label: 'user', value: 'alireza@ghotbi', color: 'text-terminal-text-light dark:text-terminal-text-dark', separator: true },
    { label: 'alias', value: 'tirok', color: 'text-terminal-text-light dark:text-terminal-text-dark' },
    { label: 'role', value: 'Junior Full Stack Web Developer', color: 'text-terminal-text-light dark:text-terminal-text-dark' },
    { label: 'location', value: 'Tehran, Iran', color: 'text-terminal-text-light dark:text-terminal-text-dark' },
    { label: 'age', value: `${age} years`, color: 'text-terminal-text-light dark:text-terminal-text-dark' },
    { label: 'shell', value: '/bin/zsh', color: 'text-terminal-text-light dark:text-terminal-text-dark' },
  ];

  const stackInfo = [
    { category: 'frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind'] },
    { category: 'backend', items: ['Django', 'PostgreSQL', 'Redis', 'Celery'] },
    { category: 'devops', items: ['Docker', 'Nginx', 'Arch Linux'] },
  ];

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4">
      <div
        className={`w-full max-w-6xl transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Terminal Header */}
        <div className="mb-4 overflow-x-auto">
          <div className="min-w-max">
            <span className="text-terminal-accent-red text-xs sm:text-sm">$</span>
            <span className="text-terminal-accent-green text-xs sm:text-sm ml-2">neofetch</span>
            <span className="text-terminal-text-light dark:text-terminal-text-dark text-xs sm:text-sm"> --config </span>
            <span className="text-terminal-accent-blue text-xs sm:text-sm">~/.config/neofetch/tirok.conf</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6 sm:gap-8 lg:gap-12">
          {/* ASCII Art */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-gradient-to-r from-terminal-accent-blue via-terminal-accent-purple to-terminal-accent-magenta bg-clip-text text-transparent">
              <AsciiArt />
            </div>
          </div>

          {/* System Info */}
          <div className="space-y-2 text-xs sm:text-sm font-mono">
            {systemInfo.map((info, index) => (
              <div key={index}>
                {info.separator && index > 0 && (
                  <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 my-3" />
                )}
                <div
                  className="flex flex-wrap gap-2 transition-all duration-500"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  }}
                >
                  <span className="text-terminal-accent-cyan font-semibold min-w-[100px]">
                    {info.label}
                  </span>
                  <span className="text-terminal-accent-yellow">{info.value}</span>
                </div>
              </div>
            ))}

            {/* Stack Section */}
            <div className="pt-4">
              <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-3" />
              <div
                className="transition-all duration-500"
                style={{
                  transitionDelay: `${systemInfo.length * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                }}
              >
                <div className="flex gap-2 mb-2">
                  <span className="text-terminal-accent-cyan font-semibold min-w-[100px]">
                    stack
                  </span>
                  <div className="flex-1 space-y-1">
                    {stackInfo.map((stack, idx) => (
                      <div key={idx} className="flex gap-2 flex-wrap">
                        <span className={`text-xs ${
                          idx === 0 ? 'text-terminal-accent-green' :
                          idx === 1 ? 'text-terminal-accent-blue' :
                          'text-terminal-accent-orange'
                        }`}>
                          [{stack.category}]
                        </span>
                        <span className="text-terminal-accent-yellow">
                          {stack.items.join(' • ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Blocks */}
            <div className="pt-4">
              <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-3" />
              <div className="flex gap-3">
                {[
                  { char: '●', color: 'text-terminal-accent-blue' },
                  { char: '●', color: 'text-terminal-accent-magenta' },
                  { char: '●', color: 'text-terminal-accent-cyan' },
                  { char: '●', color: 'text-terminal-accent-green' },
                  { char: '●', color: 'text-terminal-accent-yellow' },
                  { char: '●', color: 'text-terminal-accent-orange' },
                ].map((item, i) => (
                  <span
                    key={i}
                    className={`${item.color} text-2xl transition-all duration-300`}
                    style={{
                      transitionDelay: `${(systemInfo.length + stackInfo.length + i) * 100}ms`,
                      opacity: isVisible ? 1 : 0,
                    }}
                  >
                    {item.char}
                  </span>
                ))}
              </div>
            </div>

            {/* Blinking cursor */}
            <div className="pt-3">
              <span className="text-terminal-text-light dark:text-terminal-text-dark">
                <span className="text-terminal-accent-red">$</span>{' '}
                {typingComplete && <span className="animate-pulse">▋</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
