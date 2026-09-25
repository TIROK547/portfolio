import { locales, isValidLocale, getTranslations, type Locale } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSettings } from '@/lib/db'
import { ageFrom, bioParagraphs } from '@/lib/settings'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
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
  const translations = getTranslations(locale)
  const { profile } = getSettings()
  const age = ageFrom(profile.birthDate)
  const info = {
    name: profile.name,
    alias: profile.alias,
    role: profile.role,
    location: profile.location,
    age,
    summary: bioParagraphs(profile.bio, age)[0] ?? '',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} translations={translations} info={info} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
