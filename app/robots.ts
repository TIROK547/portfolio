import { SITE_URL } from '@/lib/seo'
import type { MetadataRoute } from 'next'
export const dynamic = 'force-dynamic'
export default function robots(): MetadataRoute.Robots {
  const publicRules = { allow: '/', disallow: ['/admin', '/api/'] }
  return {
    rules: [
      { userAgent: '*', ...publicRules },
      // Search discovery only. Training crawler policy remains unchanged.
      { userAgent: 'OAI-SearchBot', ...publicRules },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL,
  }
}
