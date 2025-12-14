import { locales, isValidLocale, getTranslations, type Locale } from '@/lib/i18n';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CursorGlass from '@/components/CursorGlass';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  const locale = params.lang as Locale;
  const translations = getTranslations(locale);

  return (
    <ThemeProvider>
      <div className="crt min-h-screen flex flex-col">
        <CursorGlass />
        <Header locale={locale} translations={translations} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer translations={translations} />
      </div>
    </ThemeProvider>
  );
}
