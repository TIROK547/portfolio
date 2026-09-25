'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommentForm({ postSlug }: { postSlug: string }) {
  const router = useRouter()
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('') // honeypot, real visitors never see it
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      setAuthor(localStorage.getItem('commentAuthor') ?? '')
    } catch {}
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDone(false)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postSlug, author, text, website }),
    }).catch(() => null)
    if (res?.ok) {
      try {
        localStorage.setItem('commentAuthor', author.trim())
      } catch {}
      setText('')
      setDone(true)
      setBusy(false)
      router.refresh()
      return
    }
    const data = res ? await res.json().catch(() => ({})) : {}
    setError(data.error ?? 'could not reach the server')
    setBusy(false)
  }

  const field =
    'w-full bg-black/20 border border-terminal-text-dark/20 px-3 py-2 text-sm text-terminal-text-dark placeholder:text-terminal-text-dark/30 focus:outline-none focus:border-terminal-accent-cyan'

  return (
    <form onSubmit={submit} className="space-y-3 border border-terminal-text-dark/20 p-4">
      <div>
        <label htmlFor="c-author" className="block text-xs text-terminal-accent-cyan mb-1">username</label>
        <input
          id="c-author"
          className={`${field} sm:max-w-xs`}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={30}
          required
          autoComplete="nickname"
          placeholder="anything you like"
        />
      </div>
      <div>
        <label htmlFor="c-text" className="block text-xs text-terminal-accent-cyan mb-1">comment</label>
        <textarea
          id="c-text"
          dir="auto"
          className={`${field} h-28 resize-y`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          required
        />
        <div className="text-right text-xs text-terminal-text-dark/40">{text.length}/1000</div>
      </div>
      {/* honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-terminal-accent-red">{error}</p>}
      {done && <p role="status" className="text-sm text-terminal-accent-green">comment posted.</p>}
      <button
        disabled={busy}
        className="px-3 py-1.5 text-sm border border-terminal-accent-green text-terminal-accent-green hover:bg-terminal-accent-green/10 transition-colors disabled:opacity-50"
      >
        {busy ? 'posting…' : 'post comment'}
      </button>
    </form>
  )
}
