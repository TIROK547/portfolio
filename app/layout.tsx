import type { Metadata } from 'next'
import { getSettings } from '@/lib/db'
import { SITE_URL, jsonLd, truncateDescription } from '@/lib/seo'
import './globals.css'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  const { profile } = getSettings()
  const name = `${profile.name} (${profile.alias})`
  const title = `${profile.name} — ${profile.role}`
  const description = truncateDescription(`${profile.name}, ${profile.role}, based in ${profile.location}.`)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${name}` }, description,
    authors: [{ name: profile.name, url: SITE_URL }], creator: profile.name,
    robots: { index: true, follow: true },
    openGraph: { type: 'website', locale: 'en_US', url: SITE_URL, siteName: name, title, description,
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-default.jpg'] },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile, contact } = getSettings()
  const person = {
    '@context': 'https://schema.org', '@type': 'Person', name: profile.name,
    alternateName: profile.alias, url: SITE_URL, email: contact.email, jobTitle: profile.role,
    sameAs: [contact.github && `https://github.com/${contact.github}`, contact.linkedin].filter(Boolean),
  }
  return (
    <html lang="en" className="dark">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} /></head>
      <body className="bg-terminal-bg-dark text-terminal-text-dark antialiased">{children}</body>
    </html>
  )
}
