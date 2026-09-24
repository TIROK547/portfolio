import { notFound } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'
import { allCategoryNames, getPostById } from '@/lib/db'
import { parseId } from '@/lib/auth'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id)
  const post = id === null ? null : getPostById(id)
  if (!post) notFound()
  return (
    <PostEditor
      initial={post}
      categories={allCategoryNames()}
      siteUrl={process.env.SITE_URL ?? 'https://portfolio.tirok.ir'}
    />
  )
}
