import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import Database from 'better-sqlite3'
import AdmZip from 'adm-zip'
import { NextRequest } from 'next/server'

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-recovery-test-'))
  process.env.DATA_DIR = path.join(dir, 'data')
  const db = await import('../lib/db')
  const backup = await import('../lib/backup')
  try {
    const initial = db.getSettings()
    const saved = { ...initial, profile: { ...initial.profile, name: 'Saved in WAL' } }
    db.saveSettings(saved)
    const image = '11111111-1111-1111-1111-111111111111.png'
    fs.writeFileSync(path.join(db.UPLOAD_DIR, image), 'image fixture')
    const snapshot = path.join(dir, 'snapshot.db')
    backup.snapshotDatabase(snapshot)
    const copied = new Database(snapshot)
    assert.equal(JSON.parse((copied.prepare("SELECT value FROM settings WHERE key='site'").get() as {value: string}).value).profile.name, 'Saved in WAL')
    copied.close()
    const zip = new AdmZip()
    zip.addFile('site.db', fs.readFileSync(snapshot))
    zip.addFile(`uploads/${image}`, Buffer.from('image fixture'))
    process.env.SESSION_SECRET = 'test-recovery-secret-with-more-than-32-characters'
    const { createSessionToken } = await import('../lib/session')
    const { GET } = await import('../app/api/admin/backup/route')
    const response = await GET(new NextRequest('http://admin.localhost/api/admin/backup', { headers: { host: 'admin.localhost', cookie: `tirok_session=${await createSessionToken()}` } }))
    assert.equal(response.status, 200)
    const buffer = Buffer.from(await response.arrayBuffer())
    const downloaded = new AdmZip(buffer)
    assert.ok(downloaded.getEntry('site.db'))
    assert.equal(downloaded.getEntry(`uploads/${image}`)!.getData().toString(), 'image fixture')
    db.saveSettings({ ...saved, profile: { ...saved.profile, name: 'Changed later' } })
    const extra = path.join(db.UPLOAD_DIR, '22222222-2222-2222-2222-222222222222.png')
    fs.writeFileSync(extra, 'extra')
    backup.restoreBackup(buffer)
    assert.equal(db.getSettings().profile.name, 'Saved in WAL')
    assert.equal(fs.existsSync(extra), false)
    assert.equal(fs.readFileSync(path.join(db.UPLOAD_DIR, image), 'utf8'), 'image fixture')
    db.saveSettings({ ...saved, profile: { ...saved.profile, name: 'Writable after restore' } })
    assert.equal(db.getSettings().profile.name, 'Writable after restore')

    const invalid = new AdmZip()
    invalid.addFile('site.db', Buffer.from('not sqlite'))
    assert.throws(() => backup.restoreBackup(invalid.toBuffer()))
    assert.equal(db.getSettings().profile.name, 'Writable after restore')
    const wrongSchema = new Database(path.join(dir, 'wrong.db'))
    wrongSchema.exec('CREATE TABLE unrelated (id INTEGER)'); wrongSchema.close()
    invalid.addFile('site.db', fs.readFileSync(path.join(dir, 'wrong.db')))
    assert.throws(() => backup.restoreBackup(invalid.toBuffer()))
    const badPath = new AdmZip(buffer)
    badPath.addFile('uploads/unexpected.txt', Buffer.from('bad'))
    assert.throws(() => backup.restoreBackup(badPath.toBuffer()))
    assert.equal(db.getSettings().profile.name, 'Writable after restore')

    // An I/O failure after replacing the database must roll back both content sets.
    const rename = fs.renameSync
    let injected = false
    fs.renameSync = ((source, target) => {
      if (!injected && String(source).includes('.restore-stage-') && String(source).endsWith('/uploads')) {
        injected = true
        throw new Error('simulated disk error')
      }
      return rename(source, target)
    }) as typeof fs.renameSync
    try { assert.throws(() => backup.restoreBackup(buffer), /simulated disk error/) }
    finally { fs.renameSync = rename }
    assert.ok(injected)
    assert.equal(db.getSettings().profile.name, 'Writable after restore')
    assert.ok(fs.existsSync(path.join(db.UPLOAD_DIR, image)))

    // Simulate termination halfway through replacement; next open must recover both.
    db.closeDb()
    const old = path.join(db.DATA_DIR, '.restore-old')
    fs.mkdirSync(old)
    fs.writeFileSync(path.join(db.DATA_DIR, '.restore-pending.json'), JSON.stringify({ hadDb: true, hadUploads: true }))
    fs.renameSync(path.join(db.DATA_DIR, 'site.db'), path.join(old, 'site.db'))
    fs.renameSync(db.UPLOAD_DIR, path.join(old, 'uploads'))
    fs.copyFileSync(snapshot, path.join(db.DATA_DIR, 'site.db'))
    fs.mkdirSync(db.UPLOAD_DIR)
    assert.equal(db.getSettings().profile.name, 'Writable after restore')
    assert.ok(fs.existsSync(path.join(db.UPLOAD_DIR, image)))

    // Offline installer/CLI path accepts the same archive, then the app can write.
    db.closeDb()
    const zipPath = path.join(dir, 'backup.zip')
    fs.writeFileSync(zipPath, buffer)
    execFileSync('python3', ['scripts/restore-data.py', zipPath, db.DATA_DIR])
    assert.equal(db.getSettings().profile.name, 'Saved in WAL')
    db.saveSettings(initial)
    for (const project of db.listProjects()) db.deleteProject(project.id)
    db.closeDb()
    assert.equal(db.listProjects().length, 0, 'deleted projects must not be reseeded')

    for (let i = 0; i < 103; i++) db.savePost({ title: `Post ${i}`, content: 'body', status: 'published', tags: [] })
    const first = db.listPosts({ publishedOnly: true, limit: 100 })
    const second = db.listPosts({ publishedOnly: true, limit: 100, offset: 100 })
    assert.equal(first.length, 100); assert.equal(second.length, 3)
    assert.equal(new Set([...first, ...second].map(p => p.id)).size, 103)
    console.log('PASS: WAL snapshot, live restore, upload replacement, invalid backup rejection, crash recovery, offline restore, no reseeding, pagination')
  } finally { db.closeDb(); fs.rmSync(dir, { recursive: true, force: true }) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
