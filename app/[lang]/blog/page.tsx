import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import BackLink from '@/components/BackLink'
import BlogFilters from '@/components/BlogFilters'
import { listCategories, listPosts, listTags } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return pageMetadata('Blog', lang, 'blog')
}

type SP = Promise<{ tag?: string | string[]; category?: string | string[]; q?: string; page?: string }>
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : [])
const one = (v: string | string[] | undefined) => (typeof v === 'string' && v ? v : undefined)

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: SP
}) {
  const { lang } = await params
  const sp = await searchParams
  const tags = many(sp.tag)
  const categories = many(sp.category)
  const q = one(sp.q)

  const page = Math.max(1, Math.min(100000, Number.parseInt(one(sp.page) ?? '1', 10) || 1))
  const pageSize = 12
  const results = listPosts({ publishedOnly: true, tag: tags, category: categories, q, limit: pageSize + 1, offset: (page - 1) * pageSize })
  const posts = results.slice(0, pageSize)
  const pageLink = (number: number) => {
    const next = new URLSearchParams()
    tags.forEach(t => next.append('tag', t))
    categories.forEach(c => next.append('category', c))
    if (q) next.set('q', q)
    next.set('page', String(number))
    return `/${lang}/blog?${next}`
  }
  const allCategories = listCategories()
  const allTags = listTags()
  const base = `/${lang}/blog`

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <BackLink fallback={`/${lang}`} className="inline-block mb-6" />
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">ls</span>{' '}
            <span className="text-terminal-accent-cyan">-lt</span>{' '}
            <span className="text-terminal-accent-blue">~/blog/</span>
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mb-4" />
          <p className="text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            showing {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            {categories.length > 0 && (
              <> · categories: <span className="text-terminal-accent-cyan">{categories.join(', ')}</span></>
            )}
            {tags.length > 0 && (
              <> · tags: <span className="text-terminal-accent-yellow">{tags.map((t) => `#${t}`).join(', ')}</span></>
            )}
            {q && <> · search: <span className="text-terminal-accent-green">&quot;{q}&quot;</span></>}
          </p>
        </div>

        <BlogFilters
          base={base}
          initialQuery={q ?? ''}
          categories={allCategories.map((c) => ({ value: c.slug, label: c.name, count: c.count }))}
          tags={allTags.map((t) => ({ value: t.name, label: t.name, count: t.count }))}
        />

        {posts.length === 0 ? (
          <div className="border border-dashed border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6 text-center text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            <span className="text-terminal-accent-cyan">[INFO]</span> {q || tags.length || categories.length || page > 1 ? 'No posts match these filters.' : 'No posts yet. Notes and articles are coming soon.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} locale={lang} />
            ))}
          </div>
        )}
        <nav aria-label="Blog pages" className="mt-8 flex items-center justify-between gap-4 text-sm">
          {page > 1 ? <Link href={pageLink(page - 1)} className="text-terminal-accent-cyan">← Newer posts</Link> : <span />}
          <span>Page {page}</span>
          {results.length > pageSize && <Link href={pageLink(page + 1)} className="text-terminal-accent-cyan">Older posts →</Link>}
        </nav>
      </div>
    </div>
  )
}
