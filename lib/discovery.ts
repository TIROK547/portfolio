import { getSettings, listPosts, listProjects } from './db'
import { SITE_URL, postUrl, siteUrl } from './seo'

export function xmlEscape(value: string): string {
  return value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!))
}
export function rssFeed(): string {
  const { profile } = getSettings()
  const posts = listPosts({ publishedOnly: true, limit: 50 })
  const updated = posts.reduce((latest, post) => post.updatedAt > latest ? post.updatedAt : latest, '')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel><title>${xmlEscape(profile.name)} — Articles &amp; development notes</title>
<link>${xmlEscape(siteUrl('en', 'blog'))}</link><description>Published articles by ${xmlEscape(profile.name)}.</description>
<language>en</language><atom:link href="${xmlEscape(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />
${updated ? `<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>` : ''}
${posts.map(post => `<item><title>${xmlEscape(post.title)}</title><link>${xmlEscape(postUrl(post.slug))}</link>
<guid isPermaLink="true">${xmlEscape(postUrl(post.slug))}</guid><dc:creator>${xmlEscape(profile.name)}</dc:creator>
<pubDate>${new Date(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
<description>${xmlEscape(post.excerpt)}</description>${post.tags.map(tag => `<category>${xmlEscape(tag)}</category>`).join('')}</item>`).join('\n')}
</channel></rss>`
}
// A factual navigation aid, not a crawler directive or a ranking guarantee.
export function llmsIndex(): string {
  const { profile } = getSettings()
  const clean = (text: string) => text.replace(/[\r\n\[\]<>]/g, ' ').replace(/\s+/g, ' ').trim()
  const projects = listProjects({ publishedOnly: true })
  const posts = listPosts({ publishedOnly: true, limit: 50 })
  return [
    `# ${clean(profile.name)} (${clean(profile.alias)})`, '',
    `> ${clean(profile.role)} based in ${clean(profile.location)}. Personal portfolio, project documentation, and development notes.`, '',
    '## Main pages',
    ...[['Home', ''], ['About and résumé', 'about'], ['Projects', 'projects'], ['Articles', 'blog'], ['Contact', 'contact']].map(([name, route]) => `- [${name}](${siteUrl('en', route)})`), '',
    '## Published projects',
    ...projects.map(project => `- [${clean(project.name)}](${siteUrl('en', 'projects', String(project.id))}): ${clean(project.summary)}`), '',
    '## Recent articles',
    ...posts.map(post => `- [${clean(post.title)}](${postUrl(post.slug)}): ${clean(post.excerpt)}`), '',
    '## Discovery', `- [Complete sitemap](${SITE_URL}/sitemap.xml)`, `- [RSS feed](${SITE_URL}/feed.xml)`, '',
  ].join('\n')
}
