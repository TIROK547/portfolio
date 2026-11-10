'use client'

import { useEffect, useState } from 'react'

export default function PostViews({ slug, initial }: { slug: string; initial: number }) {
  const [views, setViews] = useState(initial)
  useEffect(() => {
    const key = `post-view:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {}
    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, { method: 'POST' })
      .then(async response => {
        if (!response.ok) throw new Error('View not recorded')
        const data = await response.json()
        setViews(data.views)
      }).catch(() => {
        try { sessionStorage.removeItem(key) } catch {}
      })
  }, [slug])
  return <span>{views} views</span>
}
