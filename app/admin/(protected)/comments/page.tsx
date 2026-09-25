import CommentsAdmin from '@/components/admin/CommentsAdmin'
import { listCommentsForAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function CommentsPage() {
  const comments = listCommentsForAdmin()
  const siteUrl = process.env.SITE_URL ?? 'https://portfolio.tirok.ir'
  return (
    <>
      <h1 className="text-xl font-bold mb-2">
        <span className="text-terminal-accent-red">$</span> comments
      </h1>
      <p className="text-sm text-terminal-text-dark/60 mb-6">
        Newest first. Replies show up under the comment on the post with an [owner] tag. Deleting a comment also deletes the replies under it.
      </p>
      <CommentsAdmin comments={comments} siteUrl={siteUrl} />
    </>
  )
}
