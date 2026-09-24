'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).catch(() => null)
    if (res?.ok) {
      router.replace('/')
      router.refresh()
      return
    }
    const data = res ? await res.json().catch(() => ({})) : {}
    setError(data.error ?? 'could not reach the server')
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="adm-label" htmlFor="username">username</label>
        <input id="username" className="adm-input" value={username} onChange={(e) => setUsername(e.target.value)}
          autoComplete="username" autoFocus required />
      </div>
      <div>
        <label className="adm-label" htmlFor="password">password</label>
        <input id="password" type="password" className="adm-input" value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <p role="alert" className="text-sm text-terminal-accent-red">{error}</p>}
      <button className="adm-btn adm-btn-primary w-full" disabled={busy}>
        {busy ? 'signing in…' : 'sign in'}
      </button>
    </form>
  )
}
