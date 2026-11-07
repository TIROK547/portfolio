#!/usr/bin/env python3
"""Validate and restore a portfolio ZIP while the application is stopped."""
import json
import os
from pathlib import Path
import re
import shutil
import sqlite3
import sys
import tempfile
import zipfile


def restore(archive, directory, uid=1000, gid=1000):
    root = Path(directory)
    root.mkdir(parents=True, exist_ok=True)
    if Path(archive).stat().st_size > 500 * 1024 * 1024:
        raise ValueError('Backup exceeds 500 MB')
    with tempfile.TemporaryDirectory(prefix='.restore-stage-', dir=root) as tmp:
        stage = Path(tmp)
        (stage / 'uploads').mkdir()
        with zipfile.ZipFile(archive) as z:
            entries = z.infolist()
            names = [e.filename for e in entries]
            if len(entries) > 10000 or len(set(names)) != len(names) or 'site.db' not in names:
                raise ValueError('Invalid archive entries')
            if sum(e.file_size for e in entries) > 1024 ** 3:
                raise ValueError('Expanded archive exceeds 1 GB')
            for entry in entries:
                name = entry.filename
                if name == 'uploads/' and entry.is_dir():
                    continue
                if name != 'site.db' and not re.fullmatch(r'uploads/[0-9a-f-]{36}\.(png|jpg|gif|webp)', name):
                    raise ValueError('Unexpected archive path')
                if entry.is_dir() or entry.file_size > (128 if name == 'site.db' else 8) * 1024 ** 2:
                    raise ValueError('Archive entry exceeds safe limits')
                with z.open(entry) as source, open(stage / name, 'wb') as target:
                    shutil.copyfileobj(source, target)
        with sqlite3.connect(f'file:{stage / "site.db"}?mode=ro', uri=True) as db:
            if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok' or db.execute('PRAGMA foreign_key_check').fetchall():
                raise ValueError('Invalid database integrity')
            required = {'posts': {'id', 'slug', 'title', 'excerpt', 'content', 'cover_image', 'category_id', 'status', 'reading_minutes', 'created_at', 'updated_at', 'published_at'}, 'projects': {'id', 'name', 'description', 'stack', 'github', 'status', 'sort_order', 'featured'}, 'settings': {'key', 'value'}, 'categories': {'id', 'name', 'slug'}, 'tags': {'id', 'name'}, 'post_tags': {'post_id', 'tag_id'}, 'comments': {'id', 'post_id', 'parent_id', 'author', 'body', 'is_admin', 'created_at'}}
            for table, columns in required.items():
                actual = {r[1] for r in db.execute(f'PRAGMA table_info({table})')}
                if not columns <= actual:
                    raise ValueError(f'Invalid portfolio schema: {table}')
        if (root / '.restore-pending.json').exists():
            raise ValueError('An interrupted restore exists; start the app to recover it first')
        # Checkpoint only after validating the replacement, before moving existing files.
        if (root / 'site.db').exists():
            with sqlite3.connect(root / 'site.db') as db:
                db.execute('PRAGMA wal_checkpoint(TRUNCATE)')
        old = root / '.restore-old'
        shutil.rmtree(old, ignore_errors=True)
        old.mkdir()
        state = {'hadDb': (root / 'site.db').exists(), 'hadUploads': (root / 'uploads').exists()}
        journal = root / '.restore-pending.json'
        journal.write_text(json.dumps(state))
        try:
            for name in ['site.db', 'uploads']:
                if (root / name).exists():
                    (root / name).rename(old / name)
                (stage / name).rename(root / name)
            for suffix in ['-wal', '-shm']:
                (root / ('site.db' + suffix)).unlink(missing_ok=True)
            if os.geteuid() == 0:
                os.chown(root, uid, gid)
                for name in ['site.db', 'uploads']:
                    os.chown(root / name, uid, gid)
                for item in (root / 'uploads').iterdir():
                    os.chown(item, uid, gid)
            journal.unlink()
        except Exception:
            for name, existed in [('site.db', state['hadDb']), ('uploads', state['hadUploads'])]:
                if (old / name).exists() or not existed:
                    dest = root / name
                    if dest.is_dir(): shutil.rmtree(dest)
                    else: dest.unlink(missing_ok=True)
                    if existed: (old / name).rename(dest)
            journal.unlink(missing_ok=True)
            raise
        else:
            shutil.rmtree(old, ignore_errors=True)


if __name__ == '__main__':
    restore(sys.argv[1], sys.argv[2])
