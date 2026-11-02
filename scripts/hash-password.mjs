// Usage: node scripts/hash-password.mjs
// Interactive: prompts for a password (hidden)
// Non-interactive (from install.sh): node scripts/hash-password.mjs "mypassword"
// Always prints SESSION_SECRET= and ADMIN_PASSWORD_HASH= to stdout.

import { randomBytes, scryptSync } from 'node:crypto'
import readline from 'node:readline'

function generate(pw) {
  if (pw.length < 12) {
    process.stderr.write('Use at least 12 characters.\n')
    process.exit(1)
  }
  const salt = randomBytes(16)
  const hash = scryptSync(pw, salt, 64)
  process.stdout.write(`ADMIN_PASSWORD_HASH=${salt.toString('hex')}:${hash.toString('hex')}\n`)
  process.stdout.write(`SESSION_SECRET=${randomBytes(32).toString('hex')}\n`)
}

if (process.argv[2]) {
  // Non-interactive: password passed as CLI argument (used by install.sh)
  generate(process.argv[2])
} else {
  // Interactive: prompt with hidden input
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  rl._writeToOutput = (s) => {
    if (s.includes('Password')) process.stdout.write(s)
  }
  rl.question('Password: ', (pw) => {
    rl.close()
    process.stdout.write('\n')
    generate(pw)
  })
}
