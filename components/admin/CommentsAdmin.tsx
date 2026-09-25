'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminComment } from '@/lib/db'
import { formatDate } from '@/lib/format'

export default function CommentsAdmin({ comments, siteUrl }: { comments: AdminComment[]; siteUrl: string }) {
  const router = useRouter()
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const top = comments.filter((c) => !c.parentId)
  const repliesOf = (id: number) => comments.filter((c) => c.parentId === id).sort((a, b) => a.id - b.id)

  async function reply(parentId: number) {
    setBusy(true)
    setError('')
    const res = await fetch('/api/admin/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, body: text }),
    }).catch(() => null)
    if (res?.ok) {
      setText('')
      setReplyTo(null)
      router.refresh()
    } else {
      const data = res ? await res.json().catch(() => ({})) : {}
      setError(data.error ?? 'could not reach the server')
    }
    setBusy(false)
  }

  async function remove(c: AdminComment) {
    const extra = repliesOf(c.id).length ? ' Its replies will be deleted too.' : ''
    if (!confirm(`Delete this comment by "${c.author}"?${extra}`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/comments/${c.id}`, { method: 'DELETE' }).catch(() => null)
    if (res?.ok) router.refresh()
    else setError('delete failed')
    setBusy(false)
  }

  if (top.length === 0) return <p className="text-sm text-terminal-text-dark/60">No comments yet.</p>

  const Row = ({ c, isReply }: { c: AdminComment; isReply?: boolean }) => (
    <div className={isReply ? 'ml-6 pl-4 border-l border-terminal-accent-amber/40' : ''}>
      <div className="text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={c.isAdmin ? 'text-terminal-accent-amber font-semibold' : 'text-terminal-accent-yellow font-semibold'}>{c.author}</span>
        {c.isAdmin && <span className="text-terminal-accent-amber">[owner]</span>}
        <span className="text-terminal-text-dark/50">{formatDate(c.createdAt)}</span>
        {!isReply && (
          <a href={`${siteUrl}/en/blog/${c.postSlug}#comments`} target="_blank" rel="noopener noreferrer" className="text-terminal-accent-cyan hover:underline">
            on: {c.postTitle}
          </a>
        )}
        {!isReply && repliesOf(c.id).length === 0 && <span className="text-terminal-accent-orange">[no reply]</span>}
      </div>
      <p dir="auto" className="mt-1 text-sm whitespace-pre-wrap break-words">{c.body}</p>
      <div className="mt-2 flex gap-2">
        {!isReply && (
          <button className="adm-btn" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setText(''); setError('') }} disabled={busy}>
            reply
          </button>
        )}
        <button className="adm-btn adm-btn-danger" onClick={() => remove(c)} disabled={busy}>delete</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl space-y-4">
      {error && <p role="alert" className="text-sm text-terminal-accent-red">{error}</p>}
      {top.map((c) => (
        <div key={c.id} className="border border-terminal-text-dark/20 p-4 space-y-4">
          <Row c={c} />
          {repliesOf(c.id).map((r) => (
            <Row key={r.id} c={r} isReply />
          ))}
          {replyTo === c.id && (
            <div className="ml-6 space-y-2">
              <textarea
                dir="auto"
                className="adm-input h-24 resize-y"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                placeholder="your reply…"
                autoFocus
              />
              <div className="flex gap-2">
                <button className="adm-btn adm-btn-primary" onClick={() => reply(c.id)} disabled={busy || !text.trim()}>
                  {busy ? 'sending…' : 'send reply'}
                </button>
                <button className="adm-btn" onClick={() => setReplyTo(null)}>cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
