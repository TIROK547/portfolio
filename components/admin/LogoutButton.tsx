'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <button
      className="hover:text-terminal-accent-red transition-colors"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.replace('/login')
        router.refresh()
      }}
    >
      logout
    </button>
  )
}
