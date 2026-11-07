import Link from 'next/link'
import { getTranslations, type Locale } from '@/lib/i18n'
import type { SiteSettings } from '@/lib/settings'

export default function Footer({
  locale,
  profile,
  contact,
}: {
  locale: Locale
  profile: SiteSettings['profile']
  contact: SiteSettings['contact']
}) {
  const fa = locale === 'fa'
  const { nav } = getTranslations(locale)
  const linkStyle =
    'w-fit py-1 transition-colors hover:text-terminal-accent-cyan focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-terminal-accent-cyan'
  const muted = 'text-terminal-text-light/70 dark:text-terminal-text-dark/70'

  return (
    <footer className="border-t border-terminal-text-light/15 dark:border-terminal-text-dark/15">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 pb-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-8">
          <div>
            <p className={`mb-4 text-xs tracking-widest ${muted}`}>
              <span className="text-terminal-accent-green">$</span> cat
              ./signature
            </p>
            <Link
              href={`/${locale}`}
              className={`${linkStyle} text-lg font-semibold`}
            >
              {profile.alias}
              <span className="text-terminal-accent-cyan">_</span>
            </Link>
            <p className={`mt-3 max-w-sm text-xs leading-6 ${muted}`}>
              {profile.name}
              <br />
              {profile.role}
            </p>
          </div>
          <nav aria-label={fa ? 'پیوندهای پایین صفحه' : 'Footer navigation'}>
            <h2 className={`mb-4 text-xs tracking-widest ${muted}`}>
              {fa ? 'کاوش' : 'EXPLORE'}
            </h2>
            <div className="flex flex-col gap-2 text-xs">
              <Link className={linkStyle} href={`/${locale}/projects`}>
                {nav.projects}
              </Link>
              <Link className={linkStyle} href={`/${locale}/about`}>
                {nav.about}
              </Link>
              <Link className={linkStyle} href={`/${locale}/blog`}>
                {fa ? 'نوشته‌ها' : 'blog'}
              </Link>
            </div>
          </nav>
          <div>
            <h2 className={`mb-4 text-xs tracking-widest ${muted}`}>
              {fa ? 'ارتباط' : 'CONNECT'}
            </h2>
            <div className="flex flex-col gap-2 text-xs">
              <Link className={linkStyle} href={`/${locale}/contact`}>
                {fa ? 'شروع گفتگو' : 'get in touch'}{' '}
                <span aria-hidden="true">↗</span>
              </Link>
              {contact.github && (
                <a
                  className={linkStyle}
                  href={`https://github.com/${contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              )}
              {contact.email && (
                <a
                  className={`${linkStyle} break-all`}
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-t border-terminal-text-light/10 pt-5 text-xs dark:border-terminal-text-dark/10 sm:text-xs ${muted}`}
        >
          <p>
            © {new Date().getFullYear()} {profile.alias}{' '}
            <span aria-hidden="true" className="mx-2 opacity-40">
              /
            </span>{' '}
            {fa ? 'ساخته‌شده با کنجکاوی' : 'built with curiosity'}
          </p>
          <a href="#main-content" className={linkStyle}>
            {fa ? 'بازگشت به بالا' : 'back to top'}{' '}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
