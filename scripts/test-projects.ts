import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Database from 'better-sqlite3'
import { fetchProjectReadme } from '../lib/project-readme'
import { parseProjectInput } from '../lib/validate'

async function main() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portfolio-project-test-'))
  process.env.DATA_DIR = directory
  const legacy = new Database(path.join(directory, 'site.db'))
  legacy.exec(`CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, stack TEXT NOT NULL DEFAULT '[]', github TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','wip','archived')), sort_order INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0);
    INSERT INTO projects VALUES (42,'Legacy','Keep my content','["Python"]','https://github.com/example/project','wip',3,1);`)
  legacy.close()
  const db = await import('../lib/db')
  const realFetch = globalThis.fetch
  try {
    const original = db.getProject(42)!
    assert.equal(original.description, 'Keep my content')
    assert.equal(original.visibility, 'published')
    assert.equal(original.status, 'wip')
    assert.equal(original.sortOrder, 3)
    assert.deepEqual(original.images, [])
    const draft = db.saveProject({
      ...original,
      name: 'Private project',
      status: 'abandoned',
      visibility: 'draft',
      liveUrl: 'https://example.com',
      images: [
        { url: '/uploads/test.png', alt: 'A screen', kind: 'screenshot' },
      ],
      summary: 'Short summary',
    })!
    assert.equal(db.listProjects().length, 2)
    assert.equal(
      db.listProjects({ publishedOnly: true, featuredOnly: true }).length,
      1,
    )
    assert.equal(db.getProject(draft.id)?.images[0].alt, 'A screen')
    db.saveProject({ ...draft, visibility: 'published' }, draft.id)
    assert.equal(db.listProjects({ publishedOnly: true }).length, 2)
    assert.equal(
      parseProjectInput({ ...draft, description: '', github: '' }).ok,
      true,
    )
    assert.equal(
      parseProjectInput({ ...draft, liveUrl: 'javascript:alert(1)' }).ok,
      false,
    )
    assert.equal(
      parseProjectInput({ ...draft, github: 'https://evil.test/a/b' }).ok,
      false,
    )
    assert.equal(
      parseProjectInput({
        ...draft,
        images: [{ url: 'javascript:alert(1)', alt: '', kind: 'logo' }],
      }).ok,
      false,
    )
    const markdown =
      '# Readme\n\n![screen](images/screen.png)\n\n[guide](docs/guide.md)\n\n![reference][shot]\n\n[shot]: images/other.png\n\n```md\n[leave this](docs/code.md)\n```\n'
    let calls = 0
    globalThis.fetch = async () => {
      calls++
      return Response.json({
        encoding: 'base64',
        size: markdown.length,
        content: Buffer.from(markdown).toString('base64'),
        html_url: 'https://github.com/example/project/blob/main/README.md',
        download_url:
          'https://raw.githubusercontent.com/example/project/main/README.md',
      })
    }
    const imported = await fetchProjectReadme(
      'https://github.com/example/project',
    )
    assert.ok(
      imported.includes(
        'https://raw.githubusercontent.com/example/project/main/images/screen.png',
      ),
    )
    assert.ok(
      imported.includes(
        'https://github.com/example/project/blob/main/docs/guide.md',
      ),
    )
    assert.ok(
      imported.includes(
        'https://raw.githubusercontent.com/example/project/main/images/other.png',
      ),
    )
    assert.ok(imported.includes('[leave this](docs/code.md)'))
    await assert.rejects(
      fetchProjectReadme('https://evil.test/example/project'),
    )
    assert.equal(calls, 1)
    globalThis.fetch = async () => new Response('', { status: 404 })
    await assert.rejects(
      fetchProjectReadme('https://github.com/example/project'),
      /No public README/,
    )
    console.log(
      'PASS: legacy migration, project persistence, draft filtering, validation, README resolution and failure handling',
    )
  } finally {
    globalThis.fetch = realFetch
    db.getDb().close()
    rmSync(directory, { recursive: true, force: true })
  }
}
main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
