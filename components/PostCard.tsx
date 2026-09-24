import Link from 'next/link'
import type { PostSummary } from '@/lib/db'
import { formatDate } from '@/lib/format'

export default function PostCard({ post, locale = 'en' }: { post: PostSummary; locale?: string }) {
  const href = `/${locale}/blog/${post.slug}`
  return (
    <article className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-amber dark:hover:border-terminal-accent-amber transition-colors group flex flex-col">
      {post.coverImage && (
        <Link href={href} tabIndex={-1} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="w-full h-40 object-cover border-b border-terminal-text-light/20 dark:border-terminal-text-dark/20"
          />
        </Link>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60 flex flex-wrap gap-x-3">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingMinutes} min read</span>
          {post.category && (
            <Link
              href={`/${locale}/blog?category=${encodeURIComponent(post.category.slug)}`}
              className="text-terminal-accent-cyan hover:text-terminal-accent-blue"
            >
              [{post.category.name}]
            </Link>
          )}
        </div>
        <h3 dir="auto" className="text-lg font-semibold group-hover:text-terminal-accent-cyan transition-colors">
          <Link href={href}>
            <span className="text-terminal-accent-red">$</span> {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p dir="auto" className="text-sm text-terminal-text-light/80 dark:text-terminal-text-dark/80">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-1">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/${locale}/blog?tag=${encodeURIComponent(t)}`}
                className="text-xs text-terminal-accent-yellow hover:text-terminal-accent-blue"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
