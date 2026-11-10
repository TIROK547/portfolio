'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTranslations, type Locale } from '@/lib/i18n'

interface HeaderProps {
  locale: Locale
  alias: string
}

export default function Header({ locale, alias }: HeaderProps) {
  const pathname = usePathname()
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])
  useEffect(() => {
    if (menu.current) menu.current.open = false
  }, [pathname])
  const fa = locale === 'fa'
  const { nav } = getTranslations(locale)
  const items = [
    { label: nav.home, path: '' },
    { label: nav.projects, path: '/projects' },
    { label: fa ? 'نوشته‌ها' : 'blog', path: '/blog' },
    { label: nav.about, path: '/about' },
    { label: nav.contact, path: '/contact' },
  ]
  const focus =
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-terminal-accent-cyan'
  const links = (mobile = false) =>
    items.map(({ label, path }, index) => {
      const href = `/${locale}${path}`
      const active =
        pathname === href || (path !== '' && pathname.startsWith(`${href}/`))
      return (
        <Link
          key={path}
          href={href}
          aria-current={active ? 'page' : undefined}
          onClick={() => {
            if (menu.current) menu.current.open = false
          }}
          className={`${focus} flex items-center gap-3 transition-colors hover:text-terminal-accent-cyan ${mobile ? 'px-2 py-3' : 'py-5'} ${active ? 'text-terminal-accent-cyan' : 'text-terminal-text-light/60 dark:text-terminal-text-dark/60'}`}
        >
          {mobile && (
            <span aria-hidden="true" className="text-xs opacity-40">
              0{index + 1}
            </span>
          )}
          <span>{active ? `[${label}]` : label}</span>
          {mobile && active && (
            <span aria-hidden="true" className="ms-auto">
              ←
            </span>
          )}
        </Link>
      )
    })

  return (
    <header
      id="top"
      className="fixed inset-x-0 top-0 z-50 border-b border-terminal-text-light/15 bg-terminal-bg-light/95 backdrop-blur-md dark:border-terminal-text-dark/15 dark:bg-terminal-bg-dark/95"
    >
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:bg-terminal-bg-light focus:p-2 dark:focus:bg-terminal-bg-dark ${focus}`}
      >
        {fa ? 'رفتن به محتوا' : 'Skip to content'}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className={`${focus} flex min-w-0 items-baseline gap-2 text-sm font-semibold`}
          aria-label={`${alias} — ${nav.home}`}
        >
          <span aria-hidden="true" className="text-terminal-accent-green">
            ~
          </span>
          <span className="truncate">
            {alias}
            <span className="text-terminal-accent-cyan">/</span>
          </span>
          <span className="hidden text-xs font-normal tracking-widest text-terminal-text-light/70 dark:text-terminal-text-dark/70 lg:inline">
            PORTFOLIO
          </span>
        </Link>
        <details
          ref={menu}
          className="group relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null) && menu.current) menu.current.open = false
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menu.current) {
              menu.current.open = false
              menu.current.querySelector('summary')?.focus()
            }
          }}
        >
          <summary
            className={`${focus} flex min-h-11 cursor-pointer list-none items-center gap-3 text-xs [&::-webkit-details-marker]:hidden`}
          >
            <span>{fa ? 'فهرست' : 'menu'}</span>
            <span aria-hidden="true" className="relative block h-5 w-5 text-terminal-accent-cyan">
              <span className="absolute inset-x-0 top-0.5 h-px bg-current transition-transform group-open:translate-y-2 group-open:rotate-45 motion-reduce:transition-none" />
              <span className="absolute inset-x-0 top-2.5 h-px bg-current group-open:opacity-0" />
              <span className="absolute inset-x-0 top-[1.125rem] h-px bg-current transition-transform group-open:-translate-y-2 group-open:-rotate-45 motion-reduce:transition-none" />
            </span>
          </summary>
          <nav
            aria-label={fa ? 'ناوبری اصلی' : 'Main navigation'}
            className="fixed inset-x-0 top-16 sm:absolute sm:inset-x-auto sm:end-0 sm:top-[calc(100%+0.625rem)] sm:w-72 sm:border sm:shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-terminal-text-light/15 bg-terminal-bg-light px-4 py-4 text-sm dark:border-terminal-text-dark/15 dark:bg-terminal-bg-dark"
          >
            <p
              aria-hidden="true"
              className="mb-2 px-2 text-xs tracking-widest text-terminal-text-light/70 dark:text-terminal-text-dark/70"
            >
              ~/portfolio — ls
            </p>
            {links(true)}
          </nav>
        </details>
      </div>
    </header>
  )
}
