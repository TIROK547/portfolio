#!/usr/bin/env python3
"""
tirok — portfolio management CLI + TUI
Usage:
  tirok                        # launch TUI
  tirok <command> [args]       # run command directly

Commands:
  post add    [--json file]    add post
  post edit   <id|slug>        edit post
  post rm     <id|slug>        delete post
  post ls                      list posts
  post import <file.json>      bulk import posts from JSON file
  post export                  export all posts to JSON

  project add [--json file]    add project
  project edit <id>            edit project
  project rm  <id>             delete project
  project ls                   list projects

  logs [-n N] [-f]             show service logs (live with -f)
  status                       show service status
  start | stop | restart       control the Docker service

  backup                       backup data to /var/backups/tirok/
  restore                      restore from a backup in /var/backups/tirok/
  update                       pull latest from GitHub and rebuild

  uninstall                    remove everything
"""

import sys
import os
import json
import curses
import textwrap
import subprocess
import shutil
import tempfile
import datetime
import sqlite3
import re
import time

# ── config ────────────────────────────────────────────────────────────────────

INSTALL_DIR   = os.environ.get("TIROK_DIR", "/opt/portfolio")
DATA_DIR      = "/var/lib/docker/volumes/portfolio_portfolio-data/_data"
DB_PATH       = os.path.join(DATA_DIR, "site.db")
BACKUP_DIR    = "/var/backups/tirok"
COMPOSE_FILE  = os.path.join(INSTALL_DIR, "docker-compose.yml")
LOG_LINES     = 80

# ── colours ───────────────────────────────────────────────────────────────────

RED    = "\033[0;31m"
GREEN  = "\033[0;32m"
CYAN   = "\033[0;36m"
YELLOW = "\033[1;33m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def log(msg):   print(f"{CYAN}[tirok]{RESET} {msg}")
def ok(msg):    print(f"{GREEN}[✓]{RESET} {msg}")
def warn(msg):  print(f"{YELLOW}[!]{RESET} {msg}")
def die(msg):   print(f"{RED}[✗]{RESET} {msg}", file=sys.stderr); sys.exit(1)

# ── db helpers ────────────────────────────────────────────────────────────────

def get_db():
    if not os.path.exists(DB_PATH):
        die(f"Database not found at {DB_PATH}\nIs the portfolio installed and running?")
    return sqlite3.connect(DB_PATH)

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text

def reading_minutes(content):
    words = len(content.split())
    return max(1, round(words / 200))

def make_excerpt(content, length=160):
    plain = re.sub(r"[#*`>\[\]_~]", "", content)
    plain = re.sub(r"\s+", " ", plain).strip()
    return plain[:length].rstrip() + ("…" if len(plain) > length else "")

def unique_slug(db, base, exclude_id=None):
    root = base or f"post-{int(time.time())}"
    candidate = root
    i = 2
    while True:
        cur = db.execute("SELECT id FROM posts WHERE slug = ?", (candidate,)).fetchone()
        if not cur or (exclude_id and cur[0] == exclude_id):
            return candidate
        candidate = f"{root}-{i}"
        i += 1

# ── compose wrapper ───────────────────────────────────────────────────────────

def compose(*args, check=True, capture=False):
    if not os.path.exists(COMPOSE_FILE):
        die(f"docker-compose.yml not found at {COMPOSE_FILE}")
    cmd = ["docker", "compose", "-f", COMPOSE_FILE] + list(args)
    if capture:
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result
    return subprocess.run(cmd, check=check)

# ═══════════════════════════════════════════════════════════════════════════════
# POST OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════════

def list_posts(db):
    rows = db.execute("""
        SELECT p.id, p.slug, p.title, p.status, p.created_at,
               c.name AS cat
        FROM posts p LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.created_at DESC
    """).fetchall()
    return [
        {"id": r[0], "slug": r[1], "title": r[2],
         "status": r[3], "created_at": r[4], "category": r[5]}
        for r in rows
    ]

def get_post(db, id_or_slug):
    try:
        pid = int(id_or_slug)
        row = db.execute("""
            SELECT p.id, p.slug, p.title, p.excerpt, p.content,
                   p.status, p.cover_image, c.name
            FROM posts p LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = ?""", (pid,)).fetchone()
    except ValueError:
        row = db.execute("""
            SELECT p.id, p.slug, p.title, p.excerpt, p.content,
                   p.status, p.cover_image, c.name
            FROM posts p LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.slug = ?""", (id_or_slug,)).fetchone()
    if not row:
        return None
    tags = [r[0] for r in db.execute(
        "SELECT t.name FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = ?",
        (row[0],)
    ).fetchall()]
    return {
        "id": row[0], "slug": row[1], "title": row[2],
        "excerpt": row[3], "content": row[4], "status": row[5],
        "coverImage": row[6], "category": row[7], "tags": tags
    }

def save_post(db, data, post_id=None):
    now = datetime.datetime.utcnow().isoformat() + "Z"
    title   = data.get("title", "").strip()
    content = data.get("content", "")
    status  = data.get("status", "draft")
    if status not in ("draft", "published"):
        status = "draft"

    slug = slugify(data.get("slug", "") or title)
    if not slug:
        slug = f"post-{int(time.time())}"
    slug = unique_slug(db, slug, post_id)

    excerpt = (data.get("excerpt") or make_excerpt(content))[:300]
    minutes = reading_minutes(content)
    cover   = data.get("coverImage") or data.get("cover_image") or None
    cat_name = (data.get("category") or "").strip()

    cat_id = None
    if cat_name:
        cat_slug = slugify(cat_name) or cat_name
        db.execute("INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)", (cat_name, cat_slug))
        cat_id = db.execute(
            "SELECT id FROM categories WHERE slug = ? OR name = ?", (cat_slug, cat_name)
        ).fetchone()[0]

    if post_id is None:
        cur = db.execute("""
            INSERT INTO posts (slug, title, excerpt, content, cover_image, category_id,
                               status, reading_minutes, created_at, updated_at, published_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (slug, title, excerpt, content, cover, cat_id, status, minutes, now, now,
             now if status == "published" else None))
        post_id = cur.lastrowid
    else:
        prev = db.execute("SELECT published_at FROM posts WHERE id = ?", (post_id,)).fetchone()
        pub_at = None
        if prev:
            pub_at = prev[0] if status == "published" else None
            if status == "published" and not pub_at:
                pub_at = now
        db.execute("""
            UPDATE posts SET slug=?, title=?, excerpt=?, content=?, cover_image=?,
                             category_id=?, status=?, reading_minutes=?, updated_at=?,
                             published_at=? WHERE id=?""",
            (slug, title, excerpt, content, cover, cat_id, status, minutes, now, pub_at, post_id))

    db.execute("DELETE FROM post_tags WHERE post_id = ?", (post_id,))
    for tag in (data.get("tags") or []):
        tag = tag.strip()
        if tag:
            db.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag,))
            tid = db.execute("SELECT id FROM tags WHERE name = ?", (tag,)).fetchone()[0]
            db.execute("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)", (post_id, tid))

    db.commit()
    return post_id

def delete_post(db, id_or_slug):
    post = get_post(db, id_or_slug)
    if not post:
        return False
    db.execute("DELETE FROM posts WHERE id = ?", (post["id"],))
    db.commit()
    return True

# ═══════════════════════════════════════════════════════════════════════════════
# PROJECT OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════════

def list_projects(db):
    rows = db.execute(
        "SELECT id, name, description, stack, github, status, sort_order, featured "
        "FROM projects ORDER BY sort_order, id"
    ).fetchall()
    return [{
        "id": r[0], "name": r[1], "description": r[2],
        "stack": json.loads(r[3]), "github": r[4], "status": r[5],
        "sortOrder": r[6], "featured": bool(r[7])
    } for r in rows]

def get_project(db, pid):
    r = db.execute("SELECT * FROM projects WHERE id = ?", (int(pid),)).fetchone()
    if not r:
        return None
    return {"id": r[0], "name": r[1], "description": r[2],
            "stack": json.loads(r[3]), "github": r[4], "status": r[5],
            "sortOrder": r[6], "featured": bool(r[7])}

def save_project(db, data, proj_id=None):
    name   = data.get("name", "").strip()
    desc   = data.get("description", "").strip()
    github = data.get("github", "").strip()
    status = data.get("status", "active")
    if status not in ("active", "wip", "archived"):
        status = "active"
    stack  = json.dumps([s.strip() for s in (data.get("stack") or []) if s.strip()])
    order  = int(data.get("sortOrder", 0))
    feat   = 1 if data.get("featured") else 0

    if proj_id is None:
        cur = db.execute(
            "INSERT INTO projects (name, description, stack, github, status, sort_order, featured) "
            "VALUES (?,?,?,?,?,?,?)", (name, desc, stack, github, status, order, feat))
        proj_id = cur.lastrowid
    else:
        db.execute(
            "UPDATE projects SET name=?, description=?, stack=?, github=?, "
            "status=?, sort_order=?, featured=? WHERE id=?",
            (name, desc, stack, github, status, order, feat, proj_id))
    db.commit()
    return proj_id

def delete_project(db, pid):
    r = db.execute("DELETE FROM projects WHERE id = ?", (int(pid),))
    db.commit()
    return r.rowcount > 0

# ═══════════════════════════════════════════════════════════════════════════════
# EDITOR
# ═══════════════════════════════════════════════════════════════════════════════

def open_editor(initial="", suffix=".md"):
    editor = os.environ.get("EDITOR", "nano")
    with tempfile.NamedTemporaryFile(mode="w", suffix=suffix,
                                     delete=False, encoding="utf-8") as f:
        f.write(initial)
        fname = f.name
    try:
        subprocess.run([editor, fname], check=True)
        with open(fname, "r", encoding="utf-8") as f:
            return f.read()
    finally:
        os.unlink(fname)

def prompt_post_interactive(existing=None):
    """Interactive prompt to build a post dict."""
    e = existing or {}

    print(f"\n{BOLD}── Post editor ─────────────────────────────{RESET}")
    print(f"{DIM}(leave blank to keep existing value){RESET}\n")

    def ask(field, default=""):
        val = input(f"  {field} [{default}]: ").strip()
        return val if val else default

    title    = ask("title",    e.get("title", ""))
    slug_in  = ask("slug",     e.get("slug", "") )
    category = ask("category", e.get("category", "") or "")
    tags_raw = ask("tags (comma-separated)", ",".join(e.get("tags", [])))
    cover    = ask("coverImage", e.get("coverImage", "") or "")
    status   = ask("status [draft/published]", e.get("status", "draft"))

    print(f"\n  {DIM}Opening $EDITOR for content…{RESET}")
    content = open_editor(e.get("content", f"# {title}\n\n"), suffix=".md")

    return {
        "title": title,
        "slug": slug_in,
        "category": category,
        "tags": [t.strip() for t in tags_raw.split(",") if t.strip()],
        "coverImage": cover,
        "status": status,
        "content": content,
    }

def prompt_project_interactive(existing=None):
    e = existing or {}
    print(f"\n{BOLD}── Project editor ──────────────────────────{RESET}")
    print(f"{DIM}(leave blank to keep existing value){RESET}\n")

    def ask(field, default=""):
        val = input(f"  {field} [{default}]: ").strip()
        return val if val else default

    name     = ask("name",    e.get("name", ""))
    desc_def = e.get("description", "")
    print(f"\n  {DIM}Opening $EDITOR for description…{RESET}")
    desc     = open_editor(desc_def, suffix=".txt")
    github   = ask("github URL",   e.get("github", ""))
    stack_r  = ask("stack (comma-separated)", ",".join(e.get("stack", [])))
    status   = ask("status [active/wip/archived]", e.get("status", "active"))
    featured = ask("featured [y/n]", "y" if e.get("featured") else "n").lower() == "y"
    order    = ask("sort_order", str(e.get("sortOrder", 0)))

    return {
        "name": name,
        "description": desc.strip(),
        "github": github,
        "stack": [s.strip() for s in stack_r.split(",") if s.strip()],
        "status": status,
        "featured": featured,
        "sortOrder": int(order) if order.isdigit() else 0,
    }

# ═══════════════════════════════════════════════════════════════════════════════
# BACKUP / RESTORE
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    dest  = os.path.join(BACKUP_DIR, f"tirok_backup_{stamp}.zip")

    if not os.path.exists(DATA_DIR):
        die(f"Data directory not found: {DATA_DIR}")

    with tempfile.TemporaryDirectory() as tmp:
        db_src  = os.path.join(DATA_DIR, "site.db")
        upl_src = os.path.join(DATA_DIR, "uploads")
        if os.path.exists(db_src):
            shutil.copy2(db_src, os.path.join(tmp, "site.db"))
        if os.path.exists(upl_src):
            shutil.copytree(upl_src, os.path.join(tmp, "uploads"))
        shutil.make_archive(dest[:-4], "zip", tmp)

    ok(f"Backup saved to {dest}")
    _prune_backups()

def _prune_backups(keep=10):
    if not os.path.isdir(BACKUP_DIR):
        return
    files = sorted(
        [f for f in os.listdir(BACKUP_DIR) if f.endswith(".zip")],
        reverse=True
    )
    for old in files[keep:]:
        os.unlink(os.path.join(BACKUP_DIR, old))
        log(f"Pruned old backup: {old}")

def cmd_restore(path=None):
    if not os.path.isdir(BACKUP_DIR) or not os.listdir(BACKUP_DIR):
        die(f"No backups found in {BACKUP_DIR}")

    if not path:
        backups = sorted(
            [f for f in os.listdir(BACKUP_DIR) if f.endswith(".zip")],
            reverse=True
        )
        print(f"\n{BOLD}Available backups:{RESET}")
        for i, b in enumerate(backups):
            print(f"  [{i}] {b}")
        choice = input("\n  Select backup number: ").strip()
        try:
            path = os.path.join(BACKUP_DIR, backups[int(choice)])
        except (ValueError, IndexError):
            die("Invalid selection")

    if not os.path.exists(path):
        die(f"File not found: {path}")

    confirm = input(f"\n  Restore from {os.path.basename(path)}? This will OVERWRITE current data. [y/N]: ")
    if confirm.lower() != "y":
        print("Aborted.")
        return

    log("Stopping service…")
    compose("stop", check=False)

    with tempfile.TemporaryDirectory() as tmp:
        shutil.unpack_archive(path, tmp)
        db_src  = os.path.join(tmp, "site.db")
        upl_src = os.path.join(tmp, "uploads")
        if not os.path.exists(db_src):
            compose("start")
            die("Invalid backup: site.db not found")
        os.makedirs(DATA_DIR, exist_ok=True)
        shutil.copy2(db_src, os.path.join(DATA_DIR, "site.db"))
        if os.path.exists(upl_src):
            dest_upl = os.path.join(DATA_DIR, "uploads")
            if os.path.exists(dest_upl):
                shutil.rmtree(dest_upl)
            shutil.copytree(upl_src, dest_upl)

    log("Restarting service…")
    compose("start")
    ok("Restore complete.")

# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE / UNINSTALL
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_update():
    if not os.path.isdir(INSTALL_DIR):
        die(f"Install dir not found: {INSTALL_DIR}")

    log("Creating backup before update…")
    cmd_backup()

    log("Pulling latest from GitHub…")
    subprocess.run(["git", "-C", INSTALL_DIR, "pull", "origin", "main"], check=True)

    log("Rebuilding and restarting containers…")
    compose("up", "-d", "--build")
    ok("Update complete.")

def cmd_uninstall():
    print(f"\n{RED}{BOLD}WARNING: This will permanently remove the portfolio service,{RESET}")
    print(f"{RED}         its containers, volumes, nginx config, and the tirok CLI.{RESET}")
    confirm = input("\n  Type 'yes' to confirm: ").strip()
    if confirm != "yes":
        print("Aborted.")
        return

    log("Creating final backup…")
    cmd_backup()
    ok(f"Final backup in {BACKUP_DIR}")

    log("Stopping and removing containers…")
    compose("down", "-v", check=False)

    nginx_conf = "/etc/nginx/sites-enabled/portfolio"
    nginx_avail = "/etc/nginx/sites-available/portfolio"
    for f in (nginx_conf, nginx_avail):
        if os.path.exists(f):
            os.unlink(f)
            log(f"Removed {f}")
    subprocess.run(["nginx", "-t"], check=False)
    subprocess.run(["systemctl", "reload", "nginx"], check=False)

    if os.path.isdir(INSTALL_DIR):
        shutil.rmtree(INSTALL_DIR)
        log(f"Removed {INSTALL_DIR}")

    cli_path = "/usr/local/bin/tirok"
    if os.path.exists(cli_path):
        os.unlink(cli_path)
        log(f"Removed {cli_path}")

    ok("Uninstall complete. Backups remain in /var/backups/tirok/")

# ═══════════════════════════════════════════════════════════════════════════════
# STATUS / LOGS
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_status():
    print(f"\n{BOLD}── Service Status ───────────────────────────{RESET}")
    compose("ps")
    print()

    db_ok = os.path.exists(DB_PATH)
    print(f"  DB:      {'✓ ' + DB_PATH if db_ok else '✗ not found'}")
    bk_count = len([f for f in os.listdir(BACKUP_DIR) if f.endswith(".zip")]) \
               if os.path.isdir(BACKUP_DIR) else 0
    print(f"  Backups: {bk_count} in {BACKUP_DIR}")

    if db_ok:
        try:
            db = get_db()
            posts    = db.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
            published= db.execute("SELECT COUNT(*) FROM posts WHERE status='published'").fetchone()[0]
            projects = db.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
            print(f"  Posts:   {posts} total  ({published} published)")
            print(f"  Projects:{projects}")
            db.close()
        except Exception as e:
            warn(f"Could not read DB: {e}")
    print()

def cmd_logs(lines=LOG_LINES, follow=False):
    args = ["logs", "--tail", str(lines)]
    if follow:
        args.append("-f")
    compose(*args, check=False)

# ═══════════════════════════════════════════════════════════════════════════════
# CLI COMMANDS
# ═══════════════════════════════════════════════════════════════════════════════

def cli_post_add(args):
    db = get_db()
    if "--json" in args or "-j" in args:
        idx = args.index("--json") if "--json" in args else args.index("-j")
        path = args[idx + 1] if idx + 1 < len(args) else die("--json requires a file path")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            for item in data:
                pid = save_post(db, item)
                ok(f"Added post id={pid}: {item.get('title', '')}")
        else:
            pid = save_post(db, data)
            ok(f"Added post id={pid}: {data.get('title', '')}")
    else:
        data = prompt_post_interactive()
        if not data.get("title"):
            die("Title is required")
        pid = save_post(db, data)
        ok(f"Post created (id={pid}, slug={slugify(data['title'])})")
    db.close()

def cli_post_edit(args):
    if not args:
        die("Usage: tirok post edit <id|slug>")
    db = get_db()
    post = get_post(db, args[0])
    if not post:
        die(f"Post not found: {args[0]}")
    data = prompt_post_interactive(post)
    save_post(db, data, post["id"])
    ok(f"Post updated (id={post['id']})")
    db.close()

def cli_post_rm(args):
    if not args:
        die("Usage: tirok post rm <id|slug>")
    db = get_db()
    post = get_post(db, args[0])
    if not post:
        die(f"Post not found: {args[0]}")
    confirm = input(f"  Delete '{post['title']}'? [y/N]: ")
    if confirm.lower() == "y":
        delete_post(db, args[0])
        ok("Post deleted.")
    else:
        print("Aborted.")
    db.close()

def cli_post_ls(args):
    db = get_db()
    posts = list_posts(db)
    db.close()
    if not posts:
        print("No posts.")
        return
    print(f"\n{'ID':<5} {'STATUS':<12} {'TITLE':<45} {'SLUG'}")
    print("─" * 90)
    for p in posts:
        status_col = GREEN + "published" + RESET if p["status"] == "published" else DIM + "draft" + RESET
        print(f"{p['id']:<5} {status_col:<21} {p['title'][:44]:<45} {p['slug']}")
    print()

def cli_post_export(args):
    db = get_db()
    posts = list_posts(db)
    full  = []
    for p in posts:
        full.append(get_post(db, p["id"]))
    db.close()
    out = json.dumps(full, indent=2, ensure_ascii=False)
    path = args[0] if args else None
    if path:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        ok(f"Exported {len(full)} posts to {path}")
    else:
        print(out)

def cli_project_add(args):
    db = get_db()
    if "--json" in args or "-j" in args:
        idx = args.index("--json") if "--json" in args else args.index("-j")
        path = args[idx + 1] if idx + 1 < len(args) else die("--json requires a file path")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            for item in data:
                pid = save_project(db, item)
                ok(f"Added project id={pid}: {item.get('name', '')}")
        else:
            pid = save_project(db, data)
            ok(f"Added project id={pid}: {data.get('name', '')}")
    else:
        data = prompt_project_interactive()
        if not data.get("name"):
            die("Name is required")
        pid = save_project(db, data)
        ok(f"Project created (id={pid})")
    db.close()

def cli_project_edit(args):
    if not args:
        die("Usage: tirok project edit <id>")
    db = get_db()
    proj = get_project(db, args[0])
    if not proj:
        die(f"Project not found: {args[0]}")
    data = prompt_project_interactive(proj)
    save_project(db, data, proj["id"])
    ok(f"Project updated (id={proj['id']})")
    db.close()

def cli_project_rm(args):
    if not args:
        die("Usage: tirok project rm <id>")
    db = get_db()
    proj = get_project(db, args[0])
    if not proj:
        die(f"Project not found: {args[0]}")
    confirm = input(f"  Delete '{proj['name']}'? [y/N]: ")
    if confirm.lower() == "y":
        delete_project(db, args[0])
        ok("Project deleted.")
    else:
        print("Aborted.")
    db.close()

def cli_project_ls(args):
    db = get_db()
    projects = list_projects(db)
    db.close()
    if not projects:
        print("No projects.")
        return
    print(f"\n{'ID':<5} {'STATUS':<10} {'FEAT':<6} {'NAME':<35} {'GITHUB'}")
    print("─" * 90)
    for p in projects:
        feat = "★" if p["featured"] else " "
        print(f"{p['id']:<5} {p['status']:<10} {feat:<6} {p['name'][:34]:<35} {p['github']}")
    print()

# ═══════════════════════════════════════════════════════════════════════════════
# TUI
# ═══════════════════════════════════════════════════════════════════════════════

class TUI:
    MENU_ITEMS = [
        ("Posts",       "post_menu"),
        ("Projects",    "project_menu"),
        ("Logs",        "logs_screen"),
        ("Status",      "status_screen"),
        ("Backup",      "do_backup"),
        ("Restore",     "do_restore"),
        ("Update",      "do_update"),
        ("Start",       "do_start"),
        ("Stop",        "do_stop"),
        ("Restart",     "do_restart"),
        ("Uninstall",   "do_uninstall"),
        ("Quit",        "quit"),
    ]

    def __init__(self, stdscr):
        self.scr = stdscr
        self.cursor = 0
        self.msg = ""
        curses.curs_set(0)
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_CYAN,    -1)
        curses.init_pair(2, curses.COLOR_GREEN,   -1)
        curses.init_pair(3, curses.COLOR_YELLOW,  -1)
        curses.init_pair(4, curses.COLOR_BLACK,   curses.COLOR_CYAN)
        curses.init_pair(5, curses.COLOR_RED,     -1)

    def run(self):
        while True:
            self.draw_main()
            key = self.scr.getch()
            if key in (curses.KEY_UP, ord("k")):
                self.cursor = max(0, self.cursor - 1)
            elif key in (curses.KEY_DOWN, ord("j")):
                self.cursor = min(len(self.MENU_ITEMS) - 1, self.cursor + 1)
            elif key in (curses.KEY_ENTER, 10, 13, ord(" ")):
                action = self.MENU_ITEMS[self.cursor][1]
                getattr(self, action)()
            elif key == ord("q"):
                break

    def draw_main(self):
        self.scr.clear()
        h, w = self.scr.getmaxyx()

        logo = "  TIROK PORTFOLIO MANAGER"
        self.scr.addstr(1, 2, logo, curses.color_pair(1) | curses.A_BOLD)
        self.scr.addstr(2, 2, "─" * min(w - 4, 40), curses.color_pair(1))

        for i, (label, _) in enumerate(self.MENU_ITEMS):
            y = 4 + i
            if y >= h - 2:
                break
            if i == self.cursor:
                self.scr.addstr(y, 4, f"▶  {label}", curses.color_pair(4) | curses.A_BOLD)
            else:
                self.scr.addstr(y, 4, f"   {label}")

        help_txt = "↑↓/jk navigate  Enter select  q quit"
        self.scr.addstr(h - 1, 2, help_txt[:w - 3], curses.color_pair(3))

        if self.msg:
            self.scr.addstr(h - 2, 2, self.msg[:w - 3], curses.color_pair(2))

        self.scr.refresh()

    def run_shell(self, label, fn):
        """Drop to terminal, run fn(), return to TUI."""
        curses.endwin()
        print(f"\n{BOLD}── {label} ────────────────────────────────────{RESET}")
        try:
            fn()
        except SystemExit:
            pass
        except Exception as e:
            print(f"{RED}Error: {e}{RESET}")
        input(f"\n{DIM}Press Enter to return to menu…{RESET}")
        self.scr.refresh()

    # ── submenus ──────────────────────────────────────────────────────────────

    def _submenu(self, title, items):
        """Generic submenu. items = [(label, fn), ...]"""
        cursor = 0
        while True:
            self.scr.clear()
            h, w = self.scr.getmaxyx()
            self.scr.addstr(1, 2, title, curses.color_pair(1) | curses.A_BOLD)
            self.scr.addstr(2, 2, "─" * min(w - 4, 40), curses.color_pair(1))
            for i, (label, _) in enumerate(items):
                y = 4 + i
                if y >= h - 2:
                    break
                if i == cursor:
                    self.scr.addstr(y, 4, f"▶  {label}", curses.color_pair(4) | curses.A_BOLD)
                else:
                    self.scr.addstr(y, 4, f"   {label}")
            self.scr.addstr(h - 1, 2, "↑↓ navigate  Enter select  Esc back", curses.color_pair(3))
            self.scr.refresh()
            key = self.scr.getch()
            if key in (curses.KEY_UP, ord("k")):
                cursor = max(0, cursor - 1)
            elif key in (curses.KEY_DOWN, ord("j")):
                cursor = min(len(items) - 1, cursor + 1)
            elif key in (curses.KEY_ENTER, 10, 13):
                items[cursor][1]()
            elif key in (27, ord("q")):
                break

    def post_menu(self):
        self._submenu("Posts", [
            ("List posts",    lambda: self.run_shell("Posts",        lambda: cli_post_ls([]))),
            ("Add post",      lambda: self.run_shell("Add Post",     lambda: cli_post_add([]))),
            ("Edit post",     lambda: self.run_shell("Edit Post",    self._edit_post_prompt)),
            ("Delete post",   lambda: self.run_shell("Delete Post",  self._rm_post_prompt)),
            ("Import from JSON", lambda: self.run_shell("Import Posts", self._import_post_prompt)),
            ("Export to JSON", lambda: self.run_shell("Export Posts", lambda: cli_post_export([]))),
            ("Back",          lambda: None),
        ])

    def _edit_post_prompt(self):
        cli_post_ls([])
        ref = input("  Enter id or slug to edit: ").strip()
        if ref:
            cli_post_edit([ref])

    def _rm_post_prompt(self):
        cli_post_ls([])
        ref = input("  Enter id or slug to delete: ").strip()
        if ref:
            cli_post_rm([ref])

    def _import_post_prompt(self):
        path = input("  Path to JSON file: ").strip()
        if path:
            cli_post_add(["--json", path])

    def project_menu(self):
        self._submenu("Projects", [
            ("List projects",  lambda: self.run_shell("Projects",       lambda: cli_project_ls([]))),
            ("Add project",    lambda: self.run_shell("Add Project",    lambda: cli_project_add([]))),
            ("Edit project",   lambda: self.run_shell("Edit Project",   self._edit_proj_prompt)),
            ("Delete project", lambda: self.run_shell("Delete Project", self._rm_proj_prompt)),
            ("Import from JSON", lambda: self.run_shell("Import Projects", self._import_proj_prompt)),
            ("Back",           lambda: None),
        ])

    def _edit_proj_prompt(self):
        cli_project_ls([])
        ref = input("  Enter project id to edit: ").strip()
        if ref:
            cli_project_edit([ref])

    def _rm_proj_prompt(self):
        cli_project_ls([])
        ref = input("  Enter project id to delete: ").strip()
        if ref:
            cli_project_rm([ref])

    def _import_proj_prompt(self):
        path = input("  Path to JSON file: ").strip()
        if path:
            cli_project_add(["--json", path])

    def logs_screen(self):
        self.run_shell("Logs", lambda: cmd_logs(LOG_LINES, follow=True))

    def status_screen(self):
        self.run_shell("Status", cmd_status)

    def do_backup(self):
        self.run_shell("Backup", cmd_backup)
        self.msg = "Backup complete."

    def do_restore(self):
        self.run_shell("Restore", lambda: cmd_restore())
        self.msg = "Restore complete."

    def do_update(self):
        confirm = self._confirm("Pull latest from GitHub and rebuild?")
        if confirm:
            self.run_shell("Update", cmd_update)
            self.msg = "Update complete."

    def do_start(self):
        self.run_shell("Start", lambda: compose("start"))
        self.msg = "Service started."

    def do_stop(self):
        confirm = self._confirm("Stop the portfolio service?")
        if confirm:
            self.run_shell("Stop", lambda: compose("stop"))
            self.msg = "Service stopped."

    def do_restart(self):
        self.run_shell("Restart", lambda: compose("restart"))
        self.msg = "Service restarted."

    def do_uninstall(self):
        self.run_shell("Uninstall", cmd_uninstall)

    def quit(self):
        sys.exit(0)

    def _confirm(self, prompt):
        """Show a Y/N dialog in curses."""
        h, w = self.scr.getmaxyx()
        y = h // 2
        x = max(2, (w - len(prompt) - 10) // 2)
        self.scr.addstr(y, x, f" {prompt} [y/N] ", curses.color_pair(3) | curses.A_BOLD)
        self.scr.refresh()
        key = self.scr.getch()
        return key in (ord("y"), ord("Y"))


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

def usage():
    print(__doc__)
    sys.exit(0)

def main():
    args = sys.argv[1:]

    if not args:
        # Launch TUI
        curses.wrapper(lambda scr: TUI(scr).run())
        return

    cmd = args[0].lower()
    rest = args[1:]

    if cmd in ("-h", "--help", "help"):
        usage()

    elif cmd == "post":
        sub = rest[0].lower() if rest else ""
        sub_args = rest[1:]
        if sub == "add":      cli_post_add(sub_args)
        elif sub == "edit":   cli_post_edit(sub_args)
        elif sub in ("rm", "remove", "delete"): cli_post_rm(sub_args)
        elif sub in ("ls", "list"):             cli_post_ls(sub_args)
        elif sub == "import": cli_post_add(["--json"] + sub_args)
        elif sub == "export": cli_post_export(sub_args)
        else: die(f"Unknown post subcommand: {sub}\nRun 'tirok --help'")

    elif cmd == "project":
        sub = rest[0].lower() if rest else ""
        sub_args = rest[1:]
        if sub == "add":      cli_project_add(sub_args)
        elif sub == "edit":   cli_project_edit(sub_args)
        elif sub in ("rm", "remove", "delete"): cli_project_rm(sub_args)
        elif sub in ("ls", "list"):             cli_project_ls(sub_args)
        elif sub == "import": cli_project_add(["--json"] + sub_args)
        else: die(f"Unknown project subcommand: {sub}\nRun 'tirok --help'")

    elif cmd == "logs":
        n = LOG_LINES
        follow = False
        i = 0
        while i < len(rest):
            if rest[i] in ("-n", "--lines") and i + 1 < len(rest):
                n = int(rest[i + 1]); i += 2
            elif rest[i] in ("-f", "--follow"):
                follow = True; i += 1
            else:
                i += 1
        cmd_logs(n, follow)

    elif cmd == "status":    cmd_status()
    elif cmd == "start":     compose("start")
    elif cmd == "stop":      compose("stop")
    elif cmd == "restart":   compose("restart")
    elif cmd == "backup":    cmd_backup()
    elif cmd == "restore":   cmd_restore(rest[0] if rest else None)
    elif cmd == "update":    cmd_update()
    elif cmd == "uninstall": cmd_uninstall()
    else:
        die(f"Unknown command: {cmd}\nRun 'tirok --help'")

if __name__ == "__main__":
    main()
