// Tiny in-memory limiter for the login endpoint (single-process deployment).
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

export function loginBlocked(key: string): boolean {
  const e = attempts.get(key)
  if (!e || e.resetAt < Date.now()) return false
  return e.count >= MAX_ATTEMPTS
}

export function recordLoginFailure(key: string): void {
  const now = Date.now()
  const e = attempts.get(key)
  if (!e || e.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
  else e.count++
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k)
  }
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key)
}

// Sliding-window limiter for public endpoints (comments). Returns true when the caller is over the limit.
const buckets = new Map<string, number[]>()
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs)
  const limited = hits.length >= max
  if (!limited) hits.push(now)
  buckets.set(key, hits)
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) if (!v.some((t) => t > now - windowMs)) buckets.delete(k)
  }
  return limited
}
