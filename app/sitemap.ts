import type { MetadataRoute } from 'next'
import { listPosts, listProjects } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['', '/about', '/projects', '/blog', '/contact'].map(route => ({ url: `${SITE_URL}/en${route}` })),
    ...listPosts({ publishedOnly: true, limit: 50000 }).map(post => ({
      url: `${SITE_URL}/en/blog/${encodeURIComponent(post.slug)}`, lastModified: new Date(post.updatedAt),
    })),
    ...listProjects({ publishedOnly: true }).map(project => ({ url: `${SITE_URL}/en/projects/${encodeURIComponent(project.slug)}` })),
  ]
}
