import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// Stored format: "<salt hex>:<hash hex>"
export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  // Always do the scrypt work so timing doesn't reveal whether a hash is configured.
  const [saltHex = '', hashHex = ''] = (stored ?? '').split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, salt.length ? salt : Buffer.alloc(16), 64)
  if (!stored || expected.length !== actual.length) return false
  return timingSafeEqual(actual, expected)
}
