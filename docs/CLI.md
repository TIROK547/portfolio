# tirok CLI & TUI

`tirok` is the terminal management tool for the portfolio. Run it bare for the interactive TUI, or pass a command for one-shot use from scripts and your shell history.

It talks **directly to `site.db`** inside the Docker volume and wraps `docker compose` for service control — no HTTP session, no browser, no cookies.

---

## Installation

The install script puts `tirok` on your `PATH` automatically:

```
/usr/local/bin/tirok  →  /opt/portfolio/scripts/cli/tirok.py
```

Python 3 is the only dependency; it ships on every Ubuntu 22.04+ server by default. The man page is also installed at `/usr/local/share/man/man1/tirok.1.gz`.

---

## Help

```bash
tirok --help          # full command reference in the terminal
tirok -h              # same
man tirok             # man page
```

---

## TUI — interactive mode

```bash
tirok
```

Launches a full-screen curses interface:

```
  TIROK PORTFOLIO MANAGER
  ────────────────────────────────────────

  ▶  Posts
     Projects
     Logs
     Status
     Backup
     Restore
     Update
     Start
     Stop
     Restart
     Uninstall
     Quit

  ↑↓/jk navigate  Enter select  q quit
```

Navigate with arrow keys or `j`/`k`, select with Enter, go back with Esc or `q`. Operations that need terminal interaction (writing content, confirming a deletion, tailing logs) drop out of curses cleanly and return to the menu when done.

### Post submenu

```
  Posts
  ────────────────────────────────────────

  ▶  List posts
     Add post
     Edit post
     Delete post
     Import from JSON
     Export to JSON
     Back
```

### Project submenu

```
  Projects
  ────────────────────────────────────────

  ▶  List projects
     Add project
     Edit project
     Delete project
     Import from JSON
     Back
```

---

## CLI — command reference

### Posts

```bash
tirok post ls
```
List all posts. Columns: id, status, title, slug. Newest first.

```bash
tirok post add
```
Interactive: prompts for title, slug, category, tags, cover image, and status, then opens `$EDITOR` (default: `nano`) for the Markdown body.

```bash
tirok post add --json post.json
tirok post add --json posts.json   # array for bulk import
```
Non-interactive: reads from a JSON file. Accepts a single object or a JSON array. See [JSON schemas](#json-schemas).

```bash
tirok post edit <id|slug>
```
Re-opens the interactive editor with current values pre-filled. Accepts a numeric id or the post slug.

```bash
tirok post rm <id|slug>
```
Prompts for confirmation, then permanently deletes the post, its tags, and its comments.

```bash
tirok post import <file.json>
```
Alias for `tirok post add --json <file>`.

```bash
tirok post export
tirok post export posts.json
```
Dump all posts (including content and tags) to JSON. Prints to stdout if no path is given.

---

### Projects

```bash
tirok project ls
```
List all projects. Columns: id, status, featured flag, name, GitHub URL.

```bash
tirok project add
tirok project add --json project.json
```
Add a project interactively or from a JSON file (single object or array).

```bash
tirok project edit <id>
```
Re-open the interactive editor for an existing project.

```bash
tirok project rm <id>
```
Delete a project after confirmation.

```bash
tirok project import <file.json>
```
Alias for `tirok project add --json <file>`.

---

### Service control

```bash
tirok start
tirok stop
tirok restart
```
Pass-through to `docker compose start / stop / restart`, using the compose file at `$TIROK_DIR/docker-compose.yml` (default: `/opt/portfolio/docker-compose.yml`).

---

### Logs

```bash
tirok logs
tirok logs -n 200
tirok logs -f
tirok logs -n 50 -f
```

| Flag | Meaning |
|------|---------|
| `-n N` / `--lines N` | Tail the last N lines (default: 80) |
| `-f` / `--follow` | Stream new log lines live; Ctrl-C to stop |

---

### Status

```bash
tirok status
```

Prints:

- Docker container state (`docker compose ps`)
- Database path and whether it exists
- Number of backups in `/var/backups/tirok/`
- Total posts (published vs draft) and project count

---

### Backup

```bash
tirok backup
```

Zips `site.db` and the `uploads/` directory from the Docker volume into:

```
/var/backups/tirok/tirok_backup_YYYYMMDD_HHMMSS.zip
```

Auto-prunes to keep the 10 most recent backups. Also called automatically before `update` and `uninstall`.

---

### Restore

```bash
tirok restore
tirok restore /var/backups/tirok/tirok_backup_20261014_120000.zip
```

With no argument: lists available backups and lets you pick by number. With a path: restores that zip directly.

Restore sequence:
1. Stop the service
2. Overwrite `site.db` and `uploads/` in the Docker volume
3. Restart the service

---

### Update

```bash
tirok update
```

1. Create a backup
2. `git pull origin main` inside `$TIROK_DIR`
3. `docker compose up -d --build`

---

### Uninstall

```bash
tirok uninstall
```

Type `yes` to confirm, then:

1. Create a final backup in `/var/backups/tirok/`
2. `docker compose down -v` (removes containers and the data volume)
3. Remove the Nginx site config and reload Nginx
4. Remove `/opt/portfolio`
5. Remove `/usr/local/bin/tirok`

Backups in `/var/backups/tirok/` are **not** deleted.

---

## JSON schemas

### Post

```json
{
  "title":      "My Post Title",
  "slug":       "my-post-title",
  "content":    "# My Post\n\nMarkdown body here.",
  "excerpt":    "Short summary shown in listings.",
  "category":   "Dev",
  "tags":       ["go", "backend"],
  "coverImage": "https://example.com/cover.jpg",
  "status":     "draft"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | ✓ | Max 200 chars |
| `content` | ✓ | Markdown, max 200 000 chars |
| `slug` | — | Auto-generated from title if omitted; must be unique |
| `excerpt` | — | Auto-generated from content if omitted; max 300 chars |
| `category` | — | Created automatically if it does not exist |
| `tags` | — | Array of strings; tags are created automatically |
| `coverImage` | — | Must be an `/uploads/` path or an `https://` URL |
| `status` | — | `"draft"` (default) or `"published"` |

### Project

```json
{
  "name":        "calcirok",
  "description": "Kernel-level calculator written in C++.",
  "github":      "https://github.com/TIROK547/calcirok",
  "stack":       ["C++", "Linux"],
  "status":      "wip",
  "featured":    true,
  "sortOrder":   0
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✓ | Max 80 chars |
| `description` | ✓ | Max 2000 chars |
| `github` | ✓ | Must be an `https://` URL |
| `stack` | — | Array, max 12 items × 30 chars each |
| `status` | — | `"active"` (default), `"wip"`, or `"archived"` |
| `featured` | — | `true` / `false`; featured projects appear on the home page |
| `sortOrder` | — | Integer; lower = shown first |

### Bulk import

Both `post add --json` and `project add --json` accept a JSON array:

```json
[
  { "title": "First Post", "content": "...", "status": "published" },
  { "title": "Second Post", "content": "...", "status": "draft" }
]
```

---

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `TIROK_DIR` | `/opt/portfolio` | Location of `docker-compose.yml` |
| `EDITOR` | `nano` | Editor opened when writing post / project content |

Override at runtime:

```bash
EDITOR=vim tirok post add
TIROK_DIR=/srv/portfolio tirok status
```

---

## Examples

```bash
# Open the TUI
tirok

# Quick health check
tirok status

# Write and publish a post entirely in vim
EDITOR=vim tirok post add

# Seed projects from a JSON file
tirok project add --json seed-projects.json

# Export everything before migrating
tirok post export backup-posts.json

# Tail logs while debugging
tirok logs -n 200 -f

# Snapshot before making changes
tirok backup

# Roll back to a previous backup interactively
tirok restore

# Non-interactive restore (useful in scripts)
tirok restore /var/backups/tirok/tirok_backup_20261014_120000.zip

# Pull latest code and rebuild the container
tirok update
```

---

## Files

| Path | Purpose |
|------|---------|
| `/usr/local/bin/tirok` | Installed CLI wrapper (bash, one line) |
| `/opt/portfolio/scripts/cli/tirok.py` | Python script invoked by the wrapper |
| `/opt/portfolio/scripts/cli/tirok.1` | Man page source |
| `/usr/local/share/man/man1/tirok.1.gz` | Installed man page |
| `/opt/portfolio/docker-compose.yml` | Compose file used for service control |
| `/var/lib/docker/volumes/portfolio_portfolio-data/_data/site.db` | SQLite DB (accessed directly) |
| `/var/backups/tirok/` | Backup destination |
