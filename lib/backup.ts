import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import AdmZip from 'adm-zip'
import { DATA_DIR, getDb, closeDb } from './db'
import { recoverRestore } from './storage-recovery'

export const MAX_BACKUP_BYTES = 500 * 1024 * 1024
const MAX_EXPANDED_BYTES = 1024 * 1024 * 1024

export function snapshotDatabase(destination: string) {
  // SQLite produces a transactionally consistent standalone file, including WAL commits.
  getDb().prepare('VACUUM INTO ?').run(destination)
}

export function validateDatabase(filename: string) {
  const db = new Database(filename, { readonly: true, fileMustExist: true })
  try {
    if (db.pragma('integrity_check', { simple: true }) !== 'ok') throw new Error('Database integrity check failed')
    if ((db.pragma('foreign_key_check') as unknown[]).length) throw new Error('Database contains broken references')
    const required: Record<string, string[]> = {
      posts: ['id', 'slug', 'title', 'excerpt', 'content', 'cover_image', 'category_id', 'status', 'reading_minutes', 'created_at', 'updated_at', 'published_at'],
      projects: ['id', 'name', 'description', 'stack', 'github', 'status', 'sort_order', 'featured'],
      settings: ['key', 'value'], categories: ['id', 'name', 'slug'],
      tags: ['id', 'name'], post_tags: ['post_id', 'tag_id'],
      comments: ['id', 'post_id', 'parent_id', 'author', 'body', 'is_admin', 'created_at'],
    }
    for (const [table, columns] of Object.entries(required)) {
      const actual = new Set((db.prepare(`PRAGMA table_info(${table})`).all() as {name: string}[]).map(c => c.name))
      if (columns.some(c => !actual.has(c))) throw new Error(`Invalid portfolio database: ${table}`)
    }
    // Fail before replacement on malformed JSON that would break public rendering.
    for (const row of db.prepare('SELECT stack FROM projects').all() as {stack: string}[]) {
      if (!Array.isArray(JSON.parse(row.stack))) throw new Error('Invalid project stack')
    }
    for (const row of db.prepare('SELECT value FROM settings').all() as {value: string}[]) JSON.parse(row.value)
  } finally { db.close() }
}

export function restoreBackup(buffer: Buffer) {
  if (buffer.length > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 500 MB')
  const zip = new AdmZip(buffer)
  const entries = zip.getEntries()
  const names = new Set<string>()
  let expanded = 0
  if (entries.length > 10000) throw new Error('Too many archive entries')
  for (const entry of entries) {
    const name = entry.entryName
    if (names.has(name)) throw new Error('Duplicate archive entry')
    names.add(name)
    if (!(name === 'site.db' || (name === 'uploads/' && entry.isDirectory) || /^uploads\/[0-9a-f-]{36}\.(png|jpg|gif|webp)$/.test(name))) {
      throw new Error('Unexpected archive path')
    }
    expanded += entry.header.size
    if (expanded > MAX_EXPANDED_BYTES || (name === 'site.db' && entry.header.size > 128 * 1024 * 1024) || (name.startsWith('uploads/') && entry.header.size > 8 * 1024 * 1024)) {
      throw new Error('Expanded backup exceeds safe limits')
    }
  }
  if (!names.has('site.db') || zip.getEntry('site.db')!.isDirectory) throw new Error('Backup must contain site.db')
  getDb() // initialize before staging and recover any interrupted previous restore
  const stage = fs.mkdtempSync(path.join(/* turbopackIgnore: true */ DATA_DIR, '.restore-stage-'))
  const old = path.join(/* turbopackIgnore: true */ DATA_DIR, '.restore-old')
  const journal = path.join(/* turbopackIgnore: true */ DATA_DIR, '.restore-pending.json')
  try {
    fs.mkdirSync(path.join(/* turbopackIgnore: true */ stage, 'uploads'))
    for (const entry of entries) {
      if (!entry.isDirectory) fs.writeFileSync(path.join(/* turbopackIgnore: true */ stage, entry.entryName), entry.getData())
    }
    validateDatabase(path.join(/* turbopackIgnore: true */ stage, 'site.db'))
    closeDb()
    fs.rmSync(old, { recursive: true, force: true })
    fs.mkdirSync(old)
    fs.writeFileSync(journal, JSON.stringify({ hadDb: true, hadUploads: fs.existsSync(path.join(/* turbopackIgnore: true */ DATA_DIR, 'uploads')) }))
    // No await between closing the connection and reopening: requests cannot interleave.
    for (const name of ['site.db', 'uploads']) {
      const dest = path.join(/* turbopackIgnore: true */ DATA_DIR, name)
      if (fs.existsSync(dest)) fs.renameSync(dest, path.join(/* turbopackIgnore: true */ old, name))
      fs.renameSync(path.join(/* turbopackIgnore: true */ stage, name), dest)
    }
    // Keep the recovery journal until opening and migrations have succeeded.
    getDb(false)
    fs.unlinkSync(journal)
    // Replacement is committed; cleanup failures must not report a failed restore.
    try { fs.rmSync(old, { recursive: true, force: true }) } catch (error) { console.warn('[restore cleanup]', error) }
  } catch (error) {
    closeDb()
    recoverRestore(DATA_DIR)
    throw error
  } finally { fs.rmSync(stage, { recursive: true, force: true }) }
}
