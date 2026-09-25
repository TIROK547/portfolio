'use client'

import { useRouter } from 'next/navigation'

/** "cd .." - goes back to the previous page, or to `fallback` when there is no history (e.g. opened from a link). */
export default function BackLink({ fallback, className = '' }: { fallback: string; className?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className={`text-sm text-terminal-text-dark/60 hover:text-terminal-accent-cyan transition-colors ${className}`}
    >
      <span className="text-terminal-accent-magenta">←</span> cd ..
    </button>
  )
}
