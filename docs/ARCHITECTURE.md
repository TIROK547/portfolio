# Architecture

## Overview

One Next.js app, two hostnames, one SQLite database.

| Hostname | Role |
|----------|------|
| `portfolio.tirok.ir` | Public site — home, about, blog, projects, contact |
| `admin.tirok.ir` | Private editor — login required |

`middleware.ts` reads the `Host` header on every request and routes accordingly. Locally, use `http://localhost:3000` and `http://admin.localhost:3000`.

---

## Data model

Everything lives in `$DATA_DIR/site.db`:

| Table | Contents |
|-------|----------|
| `posts` | Blog posts (Markdown content, slug, status, category, tags) |
| `categories` | Post categories |
| `projects` | Portfolio projects with ordering |
| `comments` | Reader comments on published posts |
| `settings` | Key-value store for all site info (see Site Settings below) |

Uploaded images are stored at `$DATA_DIR/uploads/` and served from `/uploads/*`.

Projects are seeded once from `lib/seed-projects.ts` on first start. After that, manage them from the editor.

---

## Blog & editor

### Public blog (`portfolio.tirok.ir/[lang]/blog`)

- Lists published posts with category and tag filtering
- Individual post pages render Markdown (sanitized — raw HTML is stripped)
- Comment section on each published post
- Recent posts appear on the home page

### Editor (`admin.tirok.ir`)

- Posts: create, edit, publish/draft, delete; Markdown with live preview
- Categories and `#tags`: managed inline with posts
- Image upload: inline during post editing, 8 MB limit
- Projects: create, edit, reorder, delete
- Comments: reply (shows `[owner]` tag) or delete (deletes replies too)
- Site settings: all dynamic content (see below)
- Backup/restore: download or upload a ZIP of `site.db` + `uploads/`

---

## Site settings

The admin panel's `/settings` page manages everything that used to be hardcoded. Defaults live in `lib/settings.ts`.

| Setting group | What it controls |
|---------------|-----------------|
| Identity | Name, alias, role, location, birth date (age is computed) |
| Bio | Short and long bio text |
| Contact | Email, Telegram, GitHub, and any other contact links |
| Availability | Current status shown on the contact page |
| Tech stack | Two lists (primary and secondary) shown in the hero and about page |
| Skills | Skill tags shown on the about page |
| Interests | Interests shown on the about page |
| Resume | "Last updated" label and the resume PDF (replaced in `public/`) |

---

## Auth

- Single admin account — username + scrypt password hash in `.env`
- Login sets a signed httpOnly cookie (session token stored in `site.db`)
- Login rate limit: 5 attempts per 15 minutes per IP
- Every editor write checks the same-origin header
- `middleware.ts` enforces the cookie on all `admin.*` routes except `/login`

---

## Comments

Anyone can comment on a published post with just a username — no account required. Protections:

- Same-origin check on every submission
- Honeypot field (bots fill it, humans don't)
- Per-IP rate limit: 5 comments per 10 minutes
- Link limit per comment
- Reserved usernames: the owner's alias and name can't be impersonated

---

## i18n routing

Pages live under `app/[lang]/`. Currently only `en` is used, but the structure is ready for additional locales. The `[lang]` segment is the first URL path component (`/en/blog`, `/en/about`, etc.).
