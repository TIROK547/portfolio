import Link from 'next/link'
import { listPosts } from '@/lib/db'

export default function PostsAdminPage() {
  const posts = listPosts()
  const siteUrl = process.env.SITE_URL ?? 'https://portfolio.tirok.ir'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          <span className="text-terminal-accent-red">$</span> ls posts/
        </h1>
        <Link href="/posts/new" className="adm-btn adm-btn-primary">new post</Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-terminal-text-dark/60 border border-dashed border-terminal-text-dark/20 p-6 text-center">
          No posts yet. Write the first one.
        </p>
      ) : (
        <ul className="divide-y divide-terminal-text-dark/10 border border-terminal-text-dark/20">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
              <span className={`text-xs w-20 ${p.status === 'published' ? 'text-terminal-accent-green' : 'text-terminal-accent-yellow'}`}>
                [{p.status}]
              </span>
              <Link href={`/posts/${p.id}`} dir="auto" className="flex-1 min-w-[12rem] hover:text-terminal-accent-cyan transition-colors">
                {p.title}
              </Link>
              {p.category && <span className="text-xs text-terminal-accent-cyan">{p.category.name}</span>}
              <span className="text-xs text-terminal-text-dark/50">{(p.publishedAt ?? p.updatedAt).slice(0, 10)}</span>
              {p.status === 'published' && (
                <a href={`${siteUrl}/en/blog/${encodeURIComponent(p.slug)}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-terminal-accent-yellow hover:text-terminal-accent-blue">
                  view
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
