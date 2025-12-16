import { locales, isValidLocale, getTranslations, type Locale } from '@/lib/i18n'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CursorGlass from '@/components/CursorGlass'
import { notFound } from 'next/navigation'

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

  return (
    <ThemeProvider>
      <div className="crt min-h-screen flex flex-col">
        <CursorGlass />
        <Header locale={locale} translations={translations} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
