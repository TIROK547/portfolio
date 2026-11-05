import PostCard from '@/components/PostCard'
import BackLink from '@/components/BackLink'
import BlogFilters from '@/components/BlogFilters'
import { listCategories, listPosts, listTags } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return {
    title: 'Blog',
    description: 'Technical blog by Alireza Ghotbi — backend architecture, Go, Python, Django, server ops, and dev notes.',
    alternates: {
      canonical: `https://portfolio.tirok.ir/${lang}/blog`,
      languages: {
        en: 'https://portfolio.tirok.ir/en/blog',
        fa: 'https://portfolio.tirok.ir/fa/blog',
      },
    },
    openGraph: {
      title: 'Blog — Alireza Ghotbi',
      description: 'Technical blog on backend architecture, Go, Python, Django, and server ops.',
      url: `https://portfolio.tirok.ir/${lang}/blog`,
      type: 'website',
    },
  }
}

type SP = Promise<{ tag?: string | string[]; category?: string | string[]; q?: string }>
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

  const posts = listPosts({ publishedOnly: true, tag: tags, category: categories, q })
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
            total {posts.length} {posts.length === 1 ? 'post' : 'posts'}
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
            <span className="text-terminal-accent-cyan">[INFO]</span> nothing matches that.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} locale={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
