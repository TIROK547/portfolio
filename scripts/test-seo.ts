import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

async function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-seo-test-'))
  process.env.DATA_DIR = directory
  process.env.SITE_URL = 'https://portfolio.example.test'
  const db = await import('../lib/db')
  try {
    const settings = db.getSettings()
    db.saveSettings({ ...settings, profile: { ...settings.profile, name: 'Example & Developer', role: 'Software Developer' } })
    for (let i = 0; i < 13; i++) db.savePost({ title: `Public article ${i}`, content: 'A technical explanation.', tags: ['testing'], status: 'published' })
    const persian = db.savePost({ title: 'یادداشت فارسی', content: 'A & B <example>', excerpt: 'A & B <example>', tags: [], status: 'published' })!
    db.savePost({ title: 'SECRET DRAFT POST', content: 'PRIVATE_CONTENT', tags: [], status: 'draft' })
    const project = db.listProjects()[0]
    db.saveProject({ ...project, name: 'SECRET DRAFT PROJECT', visibility: 'draft' })
    const seo = await import('../lib/seo')
    const discovery = await import('../lib/discovery')
    const home = seo.pageMetadata('', 'en')
    assert.deepEqual(home.title, { absolute: 'Example & Developer — Software Developer' })
    assert.notEqual(seo.pageMetadata('About', 'en', 'about').description, seo.pageMetadata('Projects', 'en', 'projects').description)
    assert.equal(seo.postUrl(persian.slug), `https://portfolio.example.test/en/blog/${encodeURIComponent(persian.slug)}`)
    assert.equal(seo.jsonLd({ name: '</script><script>bad()</script>' }).includes('</script>'), false)
    const graph = seo.identityGraph()['@graph']
    assert.equal(graph[0]['@id'], seo.PERSON_ID)
    assert.equal(graph[1].publisher?.['@id'], seo.PERSON_ID)

    const blog = await import('../app/[lang]/blog/page')
    const pageTwo = await blog.generateMetadata({ params: Promise.resolve({ lang: 'en' }), searchParams: Promise.resolve({ page: '2' }) })
    assert.equal(pageTwo.alternates.canonical, 'https://portfolio.example.test/en/blog?page=2')
    assert.equal(pageTwo.openGraph.url, pageTwo.alternates.canonical)
    const filtered = await blog.generateMetadata({ params: Promise.resolve({ lang: 'en' }), searchParams: Promise.resolve({ q: 'test' }) })
    assert.deepEqual(filtered.robots, { index: false, follow: true })
    const projectPage = await import('../app/[lang]/projects/[id]/page')
    const projectMeta = await projectPage.generateMetadata({ params: Promise.resolve({ lang: 'en', id: String(project.id) }) })
    assert.equal(projectMeta.openGraph?.title, project.name)
    assert.equal(projectMeta.twitter?.title, project.name)
    const postPage = await import('../app/[lang]/blog/[slug]/page')
    const postMeta = await postPage.generateMetadata({ params: Promise.resolve({ lang: 'en', slug: persian.slug }) })
    assert.equal(postMeta.alternates?.canonical, seo.postUrl(persian.slug))

    const feed = discovery.rssFeed()
    const index = discovery.llmsIndex()
    assert.ok(feed.includes('Example &amp; Developer'))
    assert.ok(feed.includes('A &amp; B &lt;example&gt;'))
    assert.ok(index.includes(seo.postUrl(persian.slug)))
    for (const text of [feed, index]) {
      assert.ok(!text.includes('SECRET DRAFT'))
      assert.ok(!text.includes('PRIVATE_CONTENT'))
    }
    execFileSync('python3', ['-c', 'import sys,xml.etree.ElementTree as E; root=E.fromstring(sys.stdin.read()); assert len(root.findall("./channel/item"))==14'], { input: feed })
    const sitemap = (await import('../app/sitemap')).default()
    assert.ok(sitemap.some(item => item.url === seo.postUrl(persian.slug)))
    assert.ok(sitemap.every(item => !item.url.includes('/fa/')))
    const robots = (await import('../app/robots')).default()
    assert.ok(Array.isArray(robots.rules) && robots.rules.some(rule => rule.userAgent === 'OAI-SearchBot'))
    db.savePost({ ...persian, category: persian.category?.name, status: 'draft' }, persian.id)
    assert.ok(!discovery.rssFeed().includes(seo.postUrl(persian.slug)))
    assert.ok(!discovery.llmsIndex().includes(seo.postUrl(persian.slug)))
    console.log('PASS: metadata, pagination canonicals, filtered noindex, entity IDs, XML/JSON escaping, Unicode URLs, draft exclusion, crawler rules')
  } finally { db.closeDb(); fs.rmSync(directory, { recursive: true, force: true }) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
