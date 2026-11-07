import Link from 'next/link'
import AsciiArt from './AsciiArt'
import type { StackGroup } from '@/lib/settings'

interface HeroProps {
  info: {
    name: string
    alias: string
    role: string
    location: string
    age: number
  }
  stack: StackGroup[]
  locale?: string
}

export default function Hero({ info, stack, locale = 'en' }: HeroProps) {
  const fa = locale === 'fa'
  const border =
    'border-terminal-text-light/15 dark:border-terminal-text-dark/15'
  const muted = 'text-terminal-text-light/50 dark:text-terminal-text-dark/50'
  const palette = [
    'bg-terminal-accent-red',
    'bg-terminal-accent-orange',
    'bg-terminal-accent-yellow',
    'bg-terminal-accent-green',
    'bg-terminal-accent-cyan',
    'bg-terminal-accent-blue',
    'bg-terminal-accent-magenta',
  ]
  const groups = stack.slice(0, 3)

  return (
    <section
      aria-labelledby="hero-heading"
      className="px-4 pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm mb-6"
          dir="ltr"
        >
          <span className="text-terminal-accent-green">
            {info.alias}@portfolio
          </span>
          <span className={muted}>~</span>
          <span className="text-terminal-accent-red">$</span>
          <span>fastfetch</span>
          <span className={muted}>--config ./profile.jsonc</span>
        </div>

        <div className={`border ${border}`}>
          <div
            className={`flex items-center justify-between gap-4 border-b ${border} px-4 sm:px-6 py-3 text-[10px] sm:text-xs ${muted}`}
            dir="ltr"
          >
            <span>
              <span className="text-terminal-accent-cyan">~/</span>portfolio
            </span>
            <span className="tracking-widest">PROFILE / 01</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div
              className={`min-w-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r ${border} bg-terminal-accent-cyan/[0.025] px-4 sm:px-8 py-7 sm:py-10 lg:py-12`}
              dir="ltr"
              aria-hidden="true"
            >
              <div
                className={`flex items-center justify-between gap-3 text-[10px] sm:text-xs ${muted}`}
              >
                <span>./{info.alias}</span>
                <span>developer profile</span>
              </div>
              <div className="flex justify-center py-5 sm:py-8 lg:py-12 overflow-hidden">
                <AsciiArt />
              </div>
              <div className="flex items-center justify-between gap-5">
                <div className="flex gap-1.5">
                  {palette.map((color) => (
                    <span
                      key={color}
                      className={`h-3 w-4 sm:h-4 sm:w-5 ${color} opacity-80`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] ${muted}`}>utf-8</span>
              </div>
            </div>

            <div className="min-w-0 px-5 py-8 sm:p-10 lg:p-12">
              <p className="text-xs text-terminal-accent-cyan mb-3">
                {fa ? 'سلام، من' : 'hello, I’m'}
              </p>
              <h1
                id="hero-heading"
                dir="auto"
                className="text-3xl sm:text-4xl xl:text-5xl font-semibold tracking-tight leading-tight break-words"
              >
                {info.name}
                <span className="text-terminal-accent-green" aria-hidden="true">
                  .
                </span>
              </h1>
              <p
                dir="auto"
                className="mt-4 text-sm sm:text-base leading-7 text-terminal-accent-yellow"
              >
                {info.role}
              </p>

              <dl
                className={`grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-2 mt-7 text-xs sm:text-sm leading-6`}
              >
                <dt className={muted}>{fa ? 'نام مستعار' : 'alias'}</dt>
                <dd className="break-words">{info.alias}</dd>
                <dt className={muted}>{fa ? 'موقعیت' : 'based in'}</dt>
                <dd dir="auto" className="break-words">
                  {info.location}
                </dd>
                <dt className={muted}>{fa ? 'سن' : 'age'}</dt>
                <dd>
                  {info.age} {fa ? 'سال' : 'years'}
                </dd>
              </dl>

              {groups.length > 0 && (
                <div className={`mt-7 pt-6 border-t ${border}`}>
                  <dl className="space-y-3 text-xs leading-6" dir="ltr">
                    {groups.map((group) => (
                      <div
                        key={group.category}
                        className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4"
                      >
                        <dt className="text-terminal-accent-blue break-words">
                          {group.category}
                        </dt>
                        <dd className="text-terminal-text-light/75 dark:text-terminal-text-dark/75">
                          {group.items.slice(0, 3).join(' / ')}
                          {group.items.length > 3 && (
                            <span className={muted}>
                              {' '}
                              / +{group.items.length - 3}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-t ${border} px-5 sm:px-8 py-5`}
          >
            <p className={`text-xs ${muted}`} dir="ltr">
              <span className="text-terminal-accent-red">$</span>{' '}
              <span className="text-terminal-accent-green">./explore</span>
              <span
                aria-hidden="true"
                className="ms-2 inline-block h-3 w-1.5 bg-terminal-accent-cyan motion-safe:animate-blink align-middle"
              />
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-xs sm:text-sm">
              <a
                href="#work"
                className="text-terminal-accent-cyan hover:text-terminal-accent-yellow transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-terminal-accent-cyan"
              >
                {fa ? 'مشاهده پروژه‌ها' : 'view selected work'}{' '}
                <span aria-hidden="true">↓</span>
              </a>
              <Link
                href={`/${locale}/contact`}
                className="hover:text-terminal-accent-cyan transition-colors"
              >
                {fa ? 'شروع گفتگو' : 'get in touch'}{' '}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
        <div
          className={`mt-5 flex flex-wrap justify-between gap-2 text-[10px] sm:text-xs ${muted}`}
        >
          <span>
            {fa ? 'ساختن، یادگرفتن، تکرار.' : 'Building. Learning. Iterating.'}
          </span>
          <span aria-hidden="true">
            {'// '}
            {info.alias}
          </span>
        </div>
      </div>
    </section>
  )
}
