import { SITE_URL, jsonLd, postUrl, PERSON_ID, WEBSITE_ID, absoluteUrl, truncateDescription } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Markdown from '@/components/Markdown'
import BackLink from '@/components/BackLink'
import CommentSection from '@/components/CommentSection'
import { getPostBySlug, getSettings } from '@/lib/db'
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
  const { profile } = getSettings()
  const post = getPostBySlug(decode(slug))
  if (!post) notFound()
  const url = postUrl(post.slug, lang)
  return {
    title: post.title,
    description: truncateDescription(post.excerpt),
    alternates: {
      canonical: url,
      languages: {
        en: postUrl(post.slug),
      },
    },
    openGraph: {
      title: post.title,
      description: truncateDescription(post.excerpt),
      type: 'article',
      url,
      siteName: `${profile.name} (${profile.alias})`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [profile.name],
      tags: post.tags,
      // og image is served by opengraph-image.tsx in this same directory
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: truncateDescription(post.excerpt),
      images: [`${url}/opengraph-image`],
    },
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { lang, slug } = await params
  const { profile } = getSettings()
  const post = getPostBySlug(decode(slug))
  if (!post) notFound()

  const url = postUrl(post.slug, lang)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/${lang}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    isPartOf: { '@id': WEBSITE_ID },
    headline: post.title,
    description: truncateDescription(post.excerpt),
    url: url,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: profile.name,
      url: `${SITE_URL}/en/about`,
    },
    publisher: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: profile.name,
      url: `${SITE_URL}/en/about`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: post.coverImage ? absoluteUrl(post.coverImage) : `${url}/opengraph-image`,
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    timeRequired: `PT${post.readingMinutes}M`,
    inLanguage: lang,
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      <article className="max-w-3xl mx-auto">
        <BackLink fallback={`/${lang}/blog`} />

        <header className="mt-6 mb-8">
          <h1 dir="auto" className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <div className="text-xs sm:text-sm text-terminal-text-light/60 dark:text-terminal-text-dark/60 flex flex-wrap gap-x-4 gap-y-1">
            <Link href={`/${lang}/about`} rel="author" className="text-terminal-accent-cyan">By {profile.name}</Link>
            <time dateTime={post.publishedAt ?? post.createdAt}>Published {formatDate(post.publishedAt ?? post.createdAt)}</time>
            {post.updatedAt.slice(0, 10) !== (post.publishedAt ?? post.createdAt).slice(0, 10) && <time dateTime={post.updatedAt}>Updated {formatDate(post.updatedAt)}</time>}
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
          src={post.coverImage ?? `/${lang}/blog/${encodeURIComponent(post.slug)}/opengraph-image`}
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
