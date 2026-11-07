import fs from 'node:fs'
import path from 'node:path'

// An unfinished swap is rolled back on next boot. Keep this independent of db.ts.
export function recoverRestore(directory: string) {
  const journal = path.join(/* turbopackIgnore: true */ directory, '.restore-pending.json')
  if (!fs.existsSync(journal)) return
  const state = JSON.parse(fs.readFileSync(journal, 'utf8')) as { hadDb: boolean; hadUploads: boolean }
  for (const [name, existed] of [['site.db', state.hadDb], ['uploads', state.hadUploads]] as const) {
    const dest = path.join(/* turbopackIgnore: true */ directory, name)
    const old = path.join(/* turbopackIgnore: true */ directory, '.restore-old', name)
    if (fs.existsSync(old) || !existed) {
      fs.rmSync(dest, { recursive: true, force: true })
      if (name === 'site.db') {
        fs.rmSync(`${dest}-wal`, { force: true })
        fs.rmSync(`${dest}-shm`, { force: true })
      }
      if (existed) fs.renameSync(old, dest)
    }
  }
  fs.unlinkSync(journal)
  fs.rmSync(path.join(/* turbopackIgnore: true */ directory, '.restore-old'), { recursive: true, force: true })
}
