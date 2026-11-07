import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, getDb } from '../lib/db'
import { seedProjects } from '../lib/seed-projects'
import { parseProjectInput } from '../lib/validate'

async function main() {
  const projects = seedProjects.map((project, sortOrder) => {
    const parsed = parseProjectInput({ ...project, sortOrder, visibility: 'published' })
    if (!parsed.ok) throw new Error(`${project.name}: ${parsed.error}`)
    return parsed.value
  })
  if (process.argv.some((arg) => arg === '--apply') === false) {
    console.log(`Preview: replace all projects with ${projects.length} curated entries:`)
    projects.forEach((p) => console.log(`- ${p.name}`))
    console.log('Run with --apply to back up the database and replace only its projects.')
    return
  }

  const db = getDb()
  try {
    const backupDir = path.join(DATA_DIR, 'backups')
    fs.mkdirSync(backupDir, { recursive: true })
    const backup = path.join(backupDir, `before-project-refresh-${new Date().toISOString().replace(/[:.]/g, '-')}.db`)
    await db.backup(backup)
    db.transaction(() => {
      const { maxId } = db.prepare('SELECT COALESCE(MAX(id),0) AS maxId FROM projects').get() as { maxId: number }
      db.prepare('DELETE FROM projects').run()
      // Do not reuse old detail-page IDs for unrelated replacement projects.
      const insert = db.prepare(`INSERT INTO projects
        (id,name,description,stack,github,status,sort_order,featured,summary,live_url,images,visibility)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      projects.forEach((p, index) => insert.run(
        maxId + index + 1, p.name, p.description, JSON.stringify(p.stack), p.github,
        p.status, p.sortOrder, Number(p.featured), p.summary, p.liveUrl,
        JSON.stringify(p.images), p.visibility,
      ))
    })()
    console.log(`Replaced projects with ${projects.length} curated entries.`)
    console.log(`Database backup: ${path.resolve(backup)}`)
  } finally {
    db.close()
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
