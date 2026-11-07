import { locales, isValidLocale, type Locale } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSettings } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return {
    other: {
      'content-language': lang === 'fa' ? 'fa-IR' : 'en-US',
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    notFound()
  }

  const locale = lang as Locale
  const { profile, contact } = getSettings()

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} alias={profile.alias} />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16">
        {children}
      </main>
      <Footer locale={locale} profile={profile} contact={contact} />
    </div>
  )
}
