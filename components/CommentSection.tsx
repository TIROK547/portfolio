import { listComments, type Comment } from '@/lib/db'
import { formatDate } from '@/lib/format'
import CommentForm from './CommentForm'

function Item({ c, reply = false }: { c: Comment; reply?: boolean }) {
  return (
    <div className={reply ? 'ml-4 sm:ml-8 pl-4 border-l border-terminal-accent-amber/40' : ''}>
      <div className="text-xs flex flex-wrap items-center gap-x-3">
        <span className={c.isAdmin ? 'text-terminal-accent-amber font-semibold' : 'text-terminal-accent-yellow font-semibold'}>
          {c.author}
        </span>
        {c.isAdmin && <span className="text-terminal-accent-amber">[owner]</span>}
        <span className="text-terminal-text-dark/50">{formatDate(c.createdAt)}</span>
      </div>
      <p dir="auto" className="mt-1 text-sm whitespace-pre-wrap break-words text-terminal-text-dark/90">
        {c.body}
      </p>
    </div>
  )
}

export default function CommentSection({ postId, postSlug }: { postId: number; postSlug: string }) {
  const all = listComments(postId)
  const top = all.filter((c) => !c.parentId)

  return (
    <section id="comments" className="mt-12 pt-6 border-t border-terminal-text-dark/20">
      <h2 className="text-lg font-bold mb-4">
        <span className="text-terminal-accent-red">#</span> Comments{' '}
        <span className="text-sm text-terminal-text-dark/50">({all.length})</span>
      </h2>

      {top.length === 0 ? (
        <p className="text-sm text-terminal-text-dark/60 mb-6">No comments yet. Be the first.</p>
      ) : (
        <div className="space-y-5 mb-8">
          {top.map((c) => (
            <div key={c.id} className="space-y-3">
              <Item c={c} />
              {all.filter((r) => r.parentId === c.id).map((r) => (
                <Item key={r.id} c={r} reply />
              ))}
            </div>
          ))}
        </div>
      )}

      <CommentForm postSlug={postSlug} />
    </section>
  )
}
