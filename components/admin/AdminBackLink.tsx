'use client'

import { usePathname } from 'next/navigation'
import BackLink from '@/components/BackLink'

/** "cd .." on every editor page except the dashboard itself. */
export default function AdminBackLink() {
  const pathname = usePathname()
  if (pathname === '/' || pathname === '/admin') return null
  return <BackLink fallback="/" className="inline-block mb-6" />
}
