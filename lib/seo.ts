import type { Metadata } from 'next'
import { getSettings } from './db'

export const SITE_URL = (process.env.SITE_URL || 'https://portfolio.tirok.ir').replace(/\/$/, '')
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const LOCALES = ['en'] as const
export type SiteLang = (typeof LOCALES)[number]
export function siteUrl(...parts: string[]): string {
  return [SITE_URL, ...parts.map(p => p.replace(/^\//, ''))].join('/').replace(/\/$/, '')
}
export function postUrl(slug: string, lang = 'en') {
  return siteUrl(lang, 'blog', encodeURIComponent(slug))
}
export function absoluteUrl(value: string) { return new URL(value, `${SITE_URL}/`).href }
export function hreflangAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map(l => [l, siteUrl(l, path)]))
}
export function truncateDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…'
}
export function contentMetadata(title: string, description: string, url: string, image = '/og-default.jpg'): Metadata {
  const { profile } = getSettings()
  const summary = truncateDescription(description)
  return {
    title, description: summary, alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_US', siteName: `${profile.name} (${profile.alias})`, title, description: summary, url,
      images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title, description: summary, images: [absoluteUrl(image)] },
  }
}
export function pageMetadata(label: string, lang: string, route = ''): Metadata {
  const { profile, stack } = getSettings()
  const technologies = [...new Set(stack.flatMap(group => group.items))].slice(0, 5).join(', ')
  const descriptions: Record<string, string> = {
    About: `Meet ${profile.name} (${profile.alias}), ${profile.role} in ${profile.location}. Explore their background, technical skills, interests, and résumé.`,
    Projects: `Explore ${profile.name}'s software projects, source repositories, demos, and technical documentation, including ${technologies}.`,
    Blog: `Articles and development notes by ${profile.name}. Read about the projects, tools, and technical decisions behind their work.`,
    Contact: `Contact ${profile.name}, ${profile.role} in ${profile.location}, about projects and collaboration. Find email and professional profile links.`,
  }
  const title = label || `${profile.name} — ${profile.role}`
  const meta = contentMetadata(title, descriptions[label] || `${profile.name} (${profile.alias}) is a ${profile.role} in ${profile.location}. Explore projects built with ${technologies}.`, siteUrl(lang, route))
  if (!label) meta.title = { absolute: title }
  return meta
}
export function identityGraph() {
  const { profile, contact, stack } = getSettings()
  return {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Person', '@id': PERSON_ID, name: profile.name, alternateName: profile.alias,
        url: siteUrl('en', 'about'), image: absoluteUrl('/images/profile.jpg'), jobTitle: profile.role,
        email: contact.email, homeLocation: { '@type': 'Place', name: profile.location },
        knowsAbout: [...new Set(stack.flatMap(group => group.items))],
        sameAs: [contact.github && `https://github.com/${contact.github}`, contact.linkedin].filter(Boolean) },
      { '@type': 'WebSite', '@id': WEBSITE_ID, url: siteUrl('en'), name: `${profile.name} Portfolio`,
        alternateName: profile.alias, inLanguage: 'en', publisher: { '@id': PERSON_ID } },
    ],
  }
}
export function pageSchema(type: string, name: string, url: string) {
  return { '@context': 'https://schema.org', '@type': type, '@id': `${url}#webpage`, url, name,
    inLanguage: 'en', isPartOf: { '@id': WEBSITE_ID }, about: { '@id': PERSON_ID },
    ...(type === 'ProfilePage' ? { mainEntity: { '@id': PERSON_ID } } : {}) }
}
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement:
    items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) }
}
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
export function listingPage(value: unknown): number {
  return typeof value === 'string' && /^[1-9]\d{0,5}$/.test(value) ? Math.min(Number(value), 100000) : 1
}
