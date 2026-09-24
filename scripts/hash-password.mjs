// Usage: node scripts/hash-password.mjs
// Prompts for a password (hidden) and prints the ADMIN_PASSWORD_HASH line for .env
import { randomBytes, scryptSync } from 'node:crypto'
import readline from 'node:readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
rl._writeToOutput = (s) => {
  if (s.includes('Password')) process.stdout.write(s)
}

rl.question('Password: ', (pw) => {
  rl.close()
  process.stdout.write('\n')
  if (pw.length < 12) {
    console.error('Use at least 12 characters.')
    process.exit(1)
  }
  const salt = randomBytes(16)
  const hash = scryptSync(pw, salt, 64)
  console.log(`ADMIN_PASSWORD_HASH=${salt.toString('hex')}:${hash.toString('hex')}`)
  console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`)
})
