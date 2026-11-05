/**
 * Central SEO helpers.
 * Import these instead of hardcoding the base URL or building metadata by hand.
 */

export const SITE_URL = 'https://portfolio.tirok.ir'
export const SITE_NAME = 'Alireza Ghotbi (TIROK)'
export const LOCALES = ['en', 'fa'] as const
export type SiteLang = (typeof LOCALES)[number]

/** Build a full absolute URL for a path segment. */
export function siteUrl(...parts: string[]): string {
  return [SITE_URL, ...parts.map((p) => p.replace(/^\//, ''))].join('/')
}

/** Build hreflang alternates for a path that exists in every locale. */
export function hreflangAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, siteUrl(l, path)]))
}

/** Truncate a string to a safe meta description length. */
export function truncateDescription(text: string, max = 155): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}
