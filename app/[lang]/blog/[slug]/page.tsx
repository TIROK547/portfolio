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
  const { lang, slug } = await params
  const post = getPostBySlug(decode(slug))
  if (!post) return { title: 'Not found' }
  const url = `https://portfolio.tirok.ir/${lang}/blog/${slug}`
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
      languages: {
        en: `https://portfolio.tirok.ir/en/blog/${slug}`,
        fa: `https://portfolio.tirok.ir/fa/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      siteName: 'Alireza Ghotbi (TIROK)',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: ['Alireza Ghotbi'],
      tags: post.tags,
      // og image is served by opengraph-image.tsx in this same directory
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      // twitter image is auto-picked from opengraph-image.tsx
    },
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { lang, slug } = await params
  const post = getPostBySlug(decode(slug))
  if (!post) notFound()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://portfolio.tirok.ir/${lang}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://portfolio.tirok.ir/${lang}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://portfolio.tirok.ir/${lang}/blog/${slug}` },
    ],
  }

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `https://portfolio.tirok.ir/${lang}/blog/${slug}`,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Alireza Ghotbi',
      url: 'https://portfolio.tirok.ir',
    },
    publisher: {
      '@type': 'Person',
      name: 'Alireza Ghotbi',
      url: 'https://portfolio.tirok.ir',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://portfolio.tirok.ir/${lang}/blog/${slug}`,
    },
    image: post.coverImage ?? `https://portfolio.tirok.ir/${lang}/blog/${slug}/opengraph-image`,
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    timeRequired: `PT${post.readingMinutes}M`,
    inLanguage: lang,
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage ?? `/${lang}/blog/${slug}/opengraph-image`}
          alt={`Cover image for "${post.title}"`}
          className="w-full max-h-[420px] object-cover mb-8 border border-terminal-text-light/20 dark:border-terminal-text-dark/20"
        />

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
