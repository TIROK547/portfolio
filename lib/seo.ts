import type { Metadata } from 'next'
import { getSettings } from './db'

export const SITE_URL = (process.env.SITE_URL || 'https://portfolio.tirok.ir').replace(/\/$/, '')
export const LOCALES = ['en'] as const
export type SiteLang = (typeof LOCALES)[number]
export function siteUrl(...parts: string[]): string {
  return [SITE_URL, ...parts.map(p => p.replace(/^\//, ''))].join('/')
}
export function hreflangAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map(l => [l, siteUrl(l, path)]))
}
export function truncateDescription(text: string, max = 155): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…'
}
export function pageMetadata(label: string, lang: string, route = ''): Metadata {
  const { profile } = getSettings()
  const title = label || `${profile.name} — ${profile.role}`
  const description = truncateDescription(`${label ? `${label} — ` : ''}${profile.name}, ${profile.role}, based in ${profile.location}.`)
  const url = siteUrl(lang, route).replace(/\/$/, '')
  return {
    title, description, alternates: { canonical: url },
    openGraph: { title, description, url, images: ['/og-default.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-default.jpg'] },
  }
}
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
