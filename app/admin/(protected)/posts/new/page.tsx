import PostEditor from '@/components/admin/PostEditor'
import { allCategoryNames } from '@/lib/db'

export default function NewPostPage() {
  return <PostEditor categories={allCategoryNames()} siteUrl={process.env.SITE_URL ?? 'https://portfolio.tirok.ir'} />
}
