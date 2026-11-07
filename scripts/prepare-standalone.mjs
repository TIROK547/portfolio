import fs from 'node:fs'
import path from 'node:path'

const output = path.resolve('.next/standalone')
// Next copies build-time env files separately from tracing. Runtime secrets come
// from Docker env_file (or the local start script), never from the build artifact.
for (const name of fs.readdirSync(output)) {
  if (name === '.env' || name.startsWith('.env.')) fs.rmSync(path.join(output, name))
}
fs.cpSync('public', path.join(output, 'public'), { recursive: true })
fs.cpSync('.next/static', path.join(output, '.next/static'), { recursive: true })
