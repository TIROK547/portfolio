# Production readiness review — 2026-11-07

## Remediation status

Repository fixes implemented and verified after the original review below:

- Backups use a consistent SQLite snapshot; restore validates archives and database schema, replaces database/uploads together, reopens the live connection, and rolls back on errors or an interrupted swap.
- Installer/CLI restore resolves the Docker volume and sets runtime ownership. Nginx allows 501 MB multipart restore requests; restore bypasses Next Proxy's separate 10 MB body-cloning cap and authenticates host/session/origin directly.
- Post, project, and settings editors recover unsaved drafts from browser session storage. Saved drafts are cleared. Mobile admin navigation wraps without horizontal clipping.
- Blog search synchronizes with browser history, cancels pending searches on navigation, and uses replace for typing. Public and admin listings have pagination. Search inputs have labels and filter chips expose selection.
- Persian launch is deferred: `/fa/...` redirects temporarily to `/en/...` with query parameters preserved. Persian alternates are no longer advertised. Existing translation resources remain for future completion.
- Empty project tables stay empty after restart. Metadata and structured data use the configured public origin and editable profile. Empty blog and optional LinkedIn states are corrected.
- Readability/focus styles and image loading were improved. Node 22+ is required, fresh installs default to `main` (or `RELEASE_REF`), standalone startup is used, and build artifacts exclude runtime data/logs and strip build-time env files.
- Added database health endpoint, Compose health checks/log rotation, and an off-server backup script/systemd timer template.

Final checks: production build and TypeScript passed without warnings; ESLint passed without warnings; project and recovery regression suites passed; full and production-only npm audits reported zero vulnerabilities. Bash syntax and Python compilation passed. Recovery tests cover WAL commits, upload replacement, invalid archives/schema, simulated disk failure rollback, crash recovery, offline restore, reseeding, and pagination.

An isolated standalone production instance was tested through the browser: post/project/settings draft recovery, successful post save, search Back behavior, pagination, and 375px admin navigation. HTTP tests verified a 12 MB restore (above the old 10 MB limit), public-host denial, authentication/origin checks, custom-domain/profile metadata, sitemap, health, and Open Graph image generation. Test content was disposable; existing portfolio data was not changed.

**Still required on the actual production server:** build/run the Docker image, verify Nginx/TLS and persistent-volume ownership, perform a deployment restore drill, provision the off-server backup destination/SSH access, enable the supplied timer, and configure external health/backup-failure alerts. Docker was unavailable locally; those external services were not activated.

## Original review

The findings below describe the pre-fix state and preserve the evidence that motivated these changes.

## Scope and validation

- Reviewed public pages, admin forms, authentication, upload handling, SQLite persistence, metadata, installer, Docker configuration, and backup/restore paths.
- `npm run build`: passed compilation and TypeScript. Two warnings report whole-project output tracing from the restore route.
- `npm run lint`: passed with seven warnings, zero errors.
- `npm run test:projects`: passed migration, persistence, draft filtering, validation, and README handling checks.
- Local production HTTP checks: `/en`, `/fa`, English about/projects/contact/blog, sitemap, and résumé returned 200; `/` returned 308 to `/en`. Public-host admin routes returned 404; unauthenticated admin backup returned 401; admin login rendered.
- Browser inspection: desktop home; 375px-wide projects, about, blog, Persian contact, and mobile menu. No console errors/warnings in the sampled browser session. Search-history mismatch reproduced.
- Backup and restore API reproductions used disposable temporary databases and a test-only session secret. Existing content was not changed.
- Docker was unavailable. Container build/runtime, fresh Ubuntu installation, real DNS/TLS, and authenticated browser editing were not tested. The local production smoke test used `next start`, which warns that standalone output should instead use the generated server; the Dockerfile already uses that generated server.
- No implementation changes were made. Five pre-existing untracked Open Graph images were left untouched.

## Findings

### 1. P1 — Backup silently omits committed content

Locations: `app/api/admin/backup/route.ts:39`, `lib/db.ts:130`, `scripts/cli/tirok.py:368`.

The database uses WAL mode, but both the download API and CLI copy only `site.db` while the application remains running. Recent committed transactions can still exist only in `site.db-wal`. The ZIP can therefore omit recent posts, settings, comments, or even schema changes. A raw copy also does not establish a consistent SQLite snapshot during concurrent writes.

Reproduction: created a table and committed a row through the app's database connection, invoked the actual backup GET handler, extracted `site.db`, and opened it independently. The table was missing.

Fix: create a consistent snapshot through SQLite's backup API, then archive that completed snapshot. Apply the same approach to CLI backups. Verify by restoring a backup taken immediately after writes while the app is still running.

### 2. P1 — Restore reports success while the app retains the old database

Locations: `app/api/admin/restore/route.ts:85`, `lib/db.ts:124`.

Restore renames/replaces `site.db` without closing and resetting the cached `globalThis.__db` connection. That connection still points at the original database. WAL/SHM files are also unmanaged, and the old database snapshot is deleted before the replacement has been opened and validated. A page reload cannot fix a process-global connection.

Reproduction: restored a ZIP containing a database whose marker was `restored`. The API returned HTTP 200 with “Restore complete. Reload the page to see updated data.” The app's `getDb()` still returned the marker `current` from the old database.

The route only checks that a file named `site.db` exists; it does not validate SQLite integrity or the application's schema before replacing data. Upload files are merged into the existing directory rather than restored as an atomic set, and rollback restores only the database filename.

Fix: validate and stage the backup first; coordinate maintenance mode/connection closure, database and uploads replacement, WAL handling, and reopening. Keep a recoverable snapshot until validation succeeds. Test invalid backups and interrupted restores as well as successful restores.

### 3. P1 when using installer restore — Restored data is owned by root

Locations: `scripts/install.sh:260`, `scripts/install.sh:271`, `Dockerfile:19`.

The root-run installer creates the Docker volume directory and copies restored files into it without setting ownership for the container's `node` user. The Dockerfile's build-time ownership of `/data` does not change files already present in the mounted volume. With ordinary root-created directory/file permissions, SQLite cannot write to the restored database or create its WAL files, and uploads cannot be saved.

This is a source-confirmed deployment mismatch, not a completed VPS reproduction. The CLI restore also copies files as its invoking privileged user and needs the same ownership review.

Fix: create/manage the volume through Docker and set the restored tree's ownership to the runtime UID/GID. Verify a fresh restore by saving a setting, creating a post, and uploading an image from the container.

### 4. P2 — Reverse proxy rejects backups the application says it accepts

Locations: `scripts/install.sh:308`, `app/api/admin/restore/route.ts:40`, `docs/DEPLOYMENT.md`.

Restore accepts ZIPs up to 500 MB, but the generated and documented Nginx configuration limits every request to 10 MB. A portfolio with just two large uploaded images can produce a valid backup that cannot be restored through the deployed UI. Nginx returns an HTML 413 response; the client attempts JSON parsing and reports a misleading network/parsing failure.

Fix: align the restore-specific proxy limit with a deliberate application limit and show a useful 413 error. Bound compressed and expanded archive sizes before extracting.

### 5. P2 — Unsaved editor work is lost through internal navigation

Locations: `components/admin/PostEditor.tsx:45`, `components/admin/ProjectForm.tsx:9`, `components/admin/SettingsForm.tsx:16`, `app/admin/(protected)/layout.tsx:20`.

PostEditor warns only on `beforeunload`. Next.js navigation through the admin's Link components does not unload the document, so selecting another admin page discards unsaved content without that warning. Projects and settings have no corresponding dirty-state protection at all. This matters especially after writing a long project description or post.

Fix: preserve draft state or autosave it, and guard internal navigation, browser history, and document unload consistently. This finding is based on code paths; authenticated browser reproduction was outside this review.

### 6. P2 — Blog input disagrees with the active search after Back

Location: `components/BlogFilters.tsx:26`.

The input initializes from `initialQuery` only once and does not synchronize when the URL changes. Reproduced by entering `alpha`, entering `beta`, then pressing browser Back: the URL and results summary displayed `alpha`, but the input still displayed `beta`. Each debounced change also pushes a history entry, making navigation noisy.

Fix: synchronize the input with history-driven URL changes without creating a navigation loop, and consider replacing history for debounced typing. Cancel stale pending navigation when filters or clear actions change the URL. Add an explicit accessible label to the search field and expose chip selection with `aria-pressed`.

### 7. P2 — Persian routes are incomplete and have incorrect document semantics

Locations: `app/layout.tsx:93`, `app/[lang]/layout.tsx:42`, `app/[lang]/contact/page.tsx`, `app/[lang]/about/page.tsx`, `components/Header.tsx`.

All pages declare `html lang="en"`; the Persian layout does not supply a Persian language/direction boundary. The browser-rendered `/fa/contact` has Persian navigation but English interface/content. About, blog controls, and project detail UI also contain hardcoded English. Neither header nor footer provides a language switcher, while the root always redirects to English.

Fix: either complete and expose Persian support, including language/RTL semantics and navigation, or defer advertising Persian alternates until that experience is ready. Keep code samples and terminal commands explicitly LTR where needed.

### 8. P2 — Deleting all projects causes them to reappear on restart

Location: `lib/db.ts:153`.

Every fresh process seeds published projects whenever the projects table has zero rows. An intentional delete-all operation is therefore undone on the next restart, silently republishing the seed content.

Fix: use a durable first-initialization/migration marker or an explicit seed command rather than treating an empty table as a new installation.

## Additional launch work

- **Dependency triage:** `npm audit --omit=dev` reported five affected package entries: two high and three moderate, including transitive propagation. Names: `nanoid`, `source-map-js`, `minimatch`, `readdir-glob`, and `archiver`. This does not establish five exploitable app vulnerabilities; review actual reachability and use compatible fixes. Do not blindly run `npm audit fix --force`: its archiver suggestion is a major-version change, and this app imports `ZipArchive` from the current version.
- **Release selection:** `scripts/install.sh:200` clones `dev`, although the documented installer is fetched from `main`. Make the production branch/tag explicit so deployment is reproducible.
- **Mobile admin:** the admin header places the logo and six navigation/actions in one nonwrapping row (`app/admin/(protected)/layout.tsx:15`). It needs a narrow-screen layout; public-page body overflow hiding can conceal overflowing controls. This was identified in source, not authenticated mobile testing.
- **Public polish:** use a friendly “no posts yet” state when the blog is empty, rather than “nothing matches that”; remove the unused “LinkedIn Coming soon” row until there is a destination. Secondary text is often very small and heavily faded; check contrast and readability before launch.
- **Runtime contract:** the root package advertises Node >=20.9, but installed better-sqlite3 13.0.3 requires >=22. Docker uses 22 already; align the project engine and setup guidance.
- **Build packaging:** resolve the two whole-project tracing warnings in restore. Review the generated standalone contents before shipping, especially any logs or non-runtime files included in the build context.
- **SEO/content consistency:** public metadata, JSON-LD, and sitemap hardcode the original domain/profile rather than using the editable settings and configured SITE_URL. This is a bug when deploying under a different domain or changing the profile; the current visible role also differs from the root metadata's role.
- **Scale:** `listPosts` caps results at 100 with no public pagination. Older posts become unavailable through browsing once that threshold is reached. This is not an immediate blocker for the currently empty blog.
- **Operations:** after fixing recovery, perform an actual container restore drill and arrange off-server backups and uptime/error monitoring. The repository currently documents manual backup/download workflows; external production monitoring and backup schedules were not verified.

## Suggested order

1. Repair and test backup/restore, including ownership and request limits.
2. Protect editor drafts and fix search history behavior.
3. Decide Persian launch scope and address mobile admin navigation.
4. Triage dependency advisories, pin the release source, and test a fresh container deployment with persistent data.
