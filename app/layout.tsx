import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://portfolio.tirok.ir';
const SITE_NAME = 'Alireza Ghotbi (TIROK)';
const SITE_DESCRIPTION =
  'Portfolio of Alireza Ghotbi — backend developer specializing in Python (Django, FastAPI), Go, PostgreSQL, Redis, and Docker. Based in Tehran, Iran.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Backend Developer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Alireza Ghotbi',
    'TIROK',
    'backend developer',
    'Python',
    'Django',
    'FastAPI',
    'Go',
    'PostgreSQL',
    'Redis',
    'Docker',
    'Tehran',
    'Iran',
    'software engineer',
  ],
  authors: [{ name: 'Alireza Ghotbi', url: SITE_URL }],
  creator: 'Alireza Ghotbi',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': `${SITE_URL}/en`,
      'fa': `${SITE_URL}/fa`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fa_IR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Backend Developer`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Alireza Ghotbi — Backend Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Backend Developer`,
    description: SITE_DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Alireza Ghotbi',
  alternateName: 'TIROK',
  url: SITE_URL,
  email: 'dev@tirok.ir',
  jobTitle: 'Backend Developer',
  knowsAbout: ['Python', 'Django', 'FastAPI', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Next.js'],
  sameAs: ['https://github.com/TIROK547'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tehran',
    addressCountry: 'IR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="bg-terminal-bg-dark text-terminal-text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
