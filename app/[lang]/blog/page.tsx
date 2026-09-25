import Link from 'next/link'
import PostCard from '@/components/PostCard'
import BackLink from '@/components/BackLink'
import { listCategories, listPosts, listTags } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Blog - Alireza Ghotbi (tirok)',
  description: 'Daily experiences and thoughts on software, servers and study.',
}

type SP = Promise<{ tag?: string | string[]; category?: string | string[] }>
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
  const tag = one(sp.tag)
  const category = one(sp.category)

  const posts = listPosts({ publishedOnly: true, tag, category })
  const categories = listCategories()
  const tags = listTags()
  const base = `/${lang}/blog`

  const chip = (active: boolean) =>
    `text-xs px-2 py-1 border transition-colors ${
      active
        ? 'border-terminal-accent-cyan text-terminal-accent-cyan bg-terminal-accent-cyan/10'
        : 'border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan'
    }`

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
            {category && <> · category: <span className="text-terminal-accent-cyan">{category}</span></>}
            {tag && <> · tag: <span className="text-terminal-accent-yellow">#{tag}</span></>}
          </p>
        </div>

        {(categories.length > 0 || tags.length > 0) && (
          <div className="mb-8 space-y-3">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-terminal-accent-cyan min-w-[80px]">categories:</span>
                <Link href={base} className={chip(!category && !tag)}>all</Link>
                {categories.map((c) => (
                  <Link key={c.slug} href={`${base}?category=${encodeURIComponent(c.slug)}`} className={chip(category === c.slug)}>
                    {c.name} ({c.count})
                  </Link>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-terminal-accent-cyan min-w-[80px]">tags:</span>
                {tags.map((t) => (
                  <Link key={t.name} href={`${base}?tag=${encodeURIComponent(t.name)}`} className={chip(tag === t.name)}>
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="border border-dashed border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6 text-center text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            <span className="text-terminal-accent-cyan">[INFO]</span> nothing here yet.
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
