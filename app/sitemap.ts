import type { MetadataRoute } from 'next'
import { listPosts, listProjects } from '@/lib/db'

export const dynamic = 'force-dynamic'

const BASE = 'https://portfolio.tirok.ir'
const LOCALES = ['en', 'fa'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/about', '/projects', '/blog', '/contact']

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((lang) =>
    staticRoutes.map((route) => ({
      url: `${BASE}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '/blog' ? ('daily' as const) : ('monthly' as const),
      priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE}/${l}${route}`])
        ),
      },
    }))
  )

  // Deduplicate: keep only one entry per canonical route (en + fa alternates already included)
  const canonicalStatic: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE}/en${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/blog' ? ('daily' as const) : ('monthly' as const),
    priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE}/${l}${route}`])
      ),
    },
  }))

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = listPosts({ publishedOnly: true, limit: 1000 })
    blogEntries = posts.map((post) => ({
      url: `${BASE}/en/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE}/${l}/blog/${post.slug}`])
        ),
      },
    }))
  } catch {
    // DB may not be initialised at build time; that's fine
  }

  return [...canonicalStatic, ...blogEntries, ...listProjects({ publishedOnly: true }).map((p) => ({ url: `${BASE}/en/projects/${p.id}`, alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}/projects/${p.id}`])) } }))]
}
