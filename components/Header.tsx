'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import type { Locale } from '@/lib/i18n';

interface HeaderProps {
  locale: Locale;
  translations: any;
}

export default function Header({ locale, translations }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  const currentPath = pathname.replace(`/${locale}`, '');

  const navItems = [
    { name: 'home', path: '' },
    { name: 'about', path: '/about' },
    { name: 'projects', path: '/projects' },
    { name: 'contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    const fullPath = `/${locale}${path}`;
    return pathname === fullPath;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-terminal-text-dark/20 dark:border-terminal-text-dark/20 bg-terminal-bg-light/95 dark:bg-terminal-bg-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="text-lg font-bold text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan transition-colors"
            >
              <span className="text-terminal-accent-pink">$</span> tirok<span className="animate-pulse">_</span>
            </Link>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="px-3 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan dark:hover:border-terminal-accent-cyan transition-colors text-sm"
                aria-label="Toggle theme"
              >
                [{mounted ? (theme === 'dark' ? '☀' : '☾') : '○'}]
              </button>

              {/* Info Card Button */}
              <button
                onClick={() => setIsInfoCardOpen(true)}
                className="px-3 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan dark:hover:border-terminal-accent-cyan transition-colors text-sm"
              >
                [INFO]
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-3 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan dark:hover:border-terminal-accent-cyan transition-colors text-sm"
                aria-label="Toggle menu"
              >
                [MENU]
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-xs"
                aria-label="Toggle theme"
              >
                [{mounted ? (theme === 'dark' ? '☀' : '☾') : '○'}]
              </button>

              <button
                onClick={() => setIsInfoCardOpen(true)}
                className="px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-xs"
              >
                [i]
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-xs"
              >
                [≡]
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        {isMenuOpen && (
          <nav className="border-t border-terminal-text-dark/20 dark:border-terminal-text-dark/20 bg-terminal-bg-light dark:bg-terminal-bg-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={`/${locale}${item.path}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-2 px-4 transition-colors ${
                        isActive(item.path)
                          ? 'text-terminal-accent-cyan border-l-2 border-terminal-accent-cyan bg-terminal-accent-cyan/10'
                          : 'text-terminal-text-light dark:text-terminal-text-dark hover:text-terminal-accent-cyan dark:hover:text-terminal-accent-cyan hover:border-l-2 hover:border-terminal-accent-cyan/50'
                      }`}
                    >
                      <span className="text-terminal-accent-magenta">{'>'}</span> {item.name}
                      {isActive(item.path) && ' [ACTIVE]'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Info Card Modal */}
      {isInfoCardOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsInfoCardOpen(false)}
        >
          <div
            className="bg-terminal-bg-light dark:bg-terminal-bg-dark border-2 border-terminal-text-light dark:border-terminal-text-dark max-w-2xl w-full p-4 sm:p-6 relative terminal-window max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Title Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20 flex items-center px-2 gap-2">
              <span className="text-xs text-terminal-accent-pink">●</span>
              <span className="text-xs text-terminal-accent-cyan">●</span>
              <span className="text-xs text-terminal-accent-blue">●</span>
              <span className="text-xs ml-2">user_info.sh</span>
            </div>

            <button
              onClick={() => setIsInfoCardOpen(false)}
              className="absolute top-1 right-2 text-terminal-accent-pink hover:text-terminal-accent-pink/70 text-xl"
            >
              ×
            </button>

            <div className="mt-6 flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-terminal-text-light dark:border-terminal-text-dark overflow-hidden">
                  <img
                    src="/images/profile.jpg"
                    alt="Alireza Ghotbi"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-terminal-accent-blue">const</span>{' '}
                  <span className="text-terminal-text-dark">name</span> ={' '}
                  <span className="text-terminal-accent-red">"Alireza Ghotbi (tirok)"</span>;
                </div>
                <div>
                  <span className="text-terminal-accent-blue">const</span>{' '}
                  <span className="text-terminal-text-dark">role</span> ={' '}
                  <span className="text-terminal-accent-red">"Junior Full Stack Developer"</span>;
                </div>
                <div>
                  <span className="text-terminal-accent-blue">const</span>{' '}
                  <span className="text-terminal-text-dark">age</span> ={' '}
                  <span className="text-terminal-text-dark">19</span>;
                </div>
                <div>
                  <span className="text-terminal-accent-blue">const</span>{' '}
                  <span className="text-terminal-text-dark">location</span> ={' '}
                  <span className="text-terminal-accent-red">"Iran"</span>;
                </div>
                <div className="pt-2 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
                  <p className="text-terminal-text-light dark:text-terminal-text-dark/80 leading-relaxed">
                    I'm a 19-year-old full-stack developer from Iran. I build web applications with a focus on clean architecture and modern technologies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
