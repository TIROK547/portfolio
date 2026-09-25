import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Markdown from '@/components/Markdown'
import BackLink from '@/components/BackLink'
import CommentSection from '@/components/CommentSection'
import { getPostBySlug } from '@/lib/db'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Params = Promise<{ lang: string; slug: string }>

// Next decodes dynamic segments inconsistently for non-ASCII (Persian) slugs; normalise once.
const decode = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(decode(slug))
  if (!post) return { title: 'Not found' }
  return {
    title: `${post.title} - tirok`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { lang, slug } = await params
  const post = getPostBySlug(decode(slug))
  if (!post) notFound()

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <article className="max-w-3xl mx-auto">
        <BackLink fallback={`/${lang}/blog`} />

        <header className="mt-6 mb-8">
          <h1 dir="auto" className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <div className="text-xs sm:text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60 flex flex-wrap gap-x-4 gap-y-1">
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readingMinutes} min read</span>
            {post.category && (
              <Link
                href={`/${lang}/blog?category=${encodeURIComponent(post.category.slug)}`}
                className="text-terminal-accent-cyan hover:text-terminal-accent-blue"
              >
                [{post.category.name}]
              </Link>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/${lang}/blog?tag=${encodeURIComponent(t)}`}
                  className="text-sm text-terminal-accent-yellow hover:text-terminal-accent-blue"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
          <div className="h-px bg-terminal-text-light/20 dark:bg-terminal-text-dark/20 mt-6" />
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="w-full max-h-[420px] object-cover mb-8 border border-terminal-text-light/20 dark:border-terminal-text-dark/20"
          />
        )}

        <div className="text-sm sm:text-base">
          <Markdown>{post.content}</Markdown>
        </div>

        <CommentSection postId={post.id} postSlug={post.slug} />

        <footer className="mt-12 pt-6 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20">
          <Link
            href={`/${lang}/blog`}
            className="text-sm hover:text-terminal-accent-cyan transition-colors"
          >
            <span className="text-terminal-accent-magenta">→</span> more posts
          </Link>
        </footer>
      </article>
    </div>
  )
}
