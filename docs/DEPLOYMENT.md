# Deployment

This app requires a host with a **persistent disk** — the SQLite database and uploaded images are written to `DATA_DIR` at runtime. Serverless platforms (Vercel, Netlify, Railway ephemeral) won't work.

## New Ubuntu VPS

Point both DNS records (`portfolio.<domain>` and `admin.<domain>`) at the VPS, then run:

```bash
sudo apt update && sudo apt upgrade -y
bash <(curl -fsSL https://raw.githubusercontent.com/TIROK547/portfolio/main/scripts/install.sh)
```

The first command upgrades the base system. The script does the rest. It installs, on Ubuntu:

- Git
- Docker Engine and the Compose plugin (`docker compose`)
- Nginx
- Certbot (`python3-certbot-nginx`)
- Node.js 22 (used to hash the admin password; the app itself runs in Docker)
- `curl` and `unzip`

Ubuntu cloud images already include `curl`, which the second command uses to download the script. It asks for sudo if you are not root.

The script then asks for:

- Base domain (it configures `portfolio.<domain>` and `admin.<domain>`)
- Install directory (default: `/opt/portfolio`)
- Admin username and password (at least 12 characters)
- Optional backup ZIP to restore from
- Email address for Let's Encrypt

After that it:

1. Generates `SESSION_SECRET` and `ADMIN_PASSWORD_HASH`, writes `.env`
2. Builds and starts the Docker Compose service
3. Configures Nginx to proxy both hostnames to `127.0.0.1:3000`
4. Obtains TLS certificates with Certbot

Re-running the script on an existing checkout pulls the latest version before rebuilding. Packages that are already present are left in place.

---

## Manual Docker deploy

The steps below assume Docker with Compose, Node.js 22+, and a reverse proxy are already installed.

```bash
# Generate credentials
node scripts/hash-password.mjs mypassword

# Copy and fill in .env
cp .env.example .env
# Set SESSION_SECRET, ADMIN_USER, ADMIN_PASSWORD_HASH, DATA_DIR

# Build and start
docker compose up -d --build
```

The app listens on `127.0.0.1:3000`. A named Docker volume keeps the database and uploads across container rebuilds.

---

## Reverse proxy (Nginx)

Both hostnames route to the same upstream. The `Host` header must be preserved — the app uses it to distinguish the public site from the editor.

```nginx
server {
    server_name portfolio.tirok.ir admin.tirok.ir;
    client_max_body_size 10m;   # image uploads are capped at 8 MB

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Forwarded-For   $remote_addr;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Run `certbot --nginx -d portfolio.tirok.ir -d admin.tirok.ir` to add TLS.

### Cloudflare Tunnel

Point both hostnames at `http://localhost:3000` — Cloudflare preserves the original `Host` header, so no extra config is needed.

---

## Backups

Runtime data to keep backed up:

| Path | Contents |
|------|----------|
| `$DATA_DIR/site.db` | Posts, drafts, categories, tags, projects, comments, settings |
| `$DATA_DIR/uploads/` | Images uploaded through the editor |

The admin settings page (`/settings` in the editor) can export a ZIP of both. Download and store it somewhere off the server. The install script's restore option accepts the same ZIP format.

---

## Updating

If installed via the install script, re-run it in the existing checkout — it pulls and rebuilds. For manual installs:

```bash
git pull
docker compose up -d --build
```

No migrations are needed for minor updates; the app creates tables on first start and adds columns as needed.

## Release and runtime requirements

Use Node.js 22+ and a single application process per data volume. Production restore
coordinates the in-process database connection; do not run multiple app replicas
against the same SQLite files. Fresh installer clones default to `main`; set
`RELEASE_REF` to an explicitly reviewed release branch/tag when installing.
Set `SITE_URL` to the public HTTPS origin. Metadata and sitemap use this value.
Persian routes temporarily redirect to their English equivalent until translation
is complete; only English URLs are advertised to search engines.

## Restore limits and validation

Backups contain consistent SQLite snapshots, including recent WAL commits. Restore
validates the ZIP paths, database integrity/schema, and size before replacing data.
Maximum ZIP size is 500 MB; maximum expanded size is 1 GB, database 128 MB, and each
uploaded image 8 MB. Configure Nginx with this additional location (the installer
does so automatically):

```nginx
location = /api/admin/restore {
    client_max_body_size 501m;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}
```

Keep the ordinary 10 MB limit for other routes. The restore endpoint bypasses
Next.js Proxy's 10 MB body-copy limit and performs host/session/origin checks
in the route itself. Offline installer and CLI restores
validate first, stop the service, and assign restored data to container UID/GID
1000. An interrupted in-app replacement is rolled back when the database next opens.
Keep a separate off-server backup; a recovery directory on the same disk is not a
substitute for one. Exercise restore on a disposable deployment before launch.

## Scheduled off-server backups and health monitoring

`GET /api/health` checks database availability and returns 200 or 503 without content
or credentials. Docker Compose has a health check and bounded container logs.
Configure an external uptime monitor against `https://<public-host>/api/health`
and alert on non-200 responses and certificate expiry. Docker's unhealthy status
alone does not send alerts or restart an unhealthy-but-running process.

For daily snapshots replicated to another server, install `rsync`, provision an
SSH key restricted to the backup destination, and create a root-readable
`/etc/tirok-backup.env` (mode 600):

```text
BACKUP_DEST=backup-user@backup-host:/backups/portfolio
```

Then copy `scripts/systemd/tirok-backup.{service,timer}` to `/etc/systemd/system/`.
Adjust the service's `/opt/portfolio` path if installed elsewhere. Enable with
`sudo systemctl daemon-reload && sudo systemctl enable --now tirok-backup.timer`.
Run the service once, check `journalctl -u tirok-backup.service`, and verify the ZIP
on the remote host. Local retention keeps ten snapshots; remote retention is a
separate policy. Monitoring and destination credentials must be configured on the
actual production host; they are not activated by building the app.


## Local production verification

Run `npm run build` then `npm start`. The postbuild step prepares static/public
assets for standalone output and strips copied environment files. The start
script reads the local `.env` without overriding exported environment variables
and resolves `DATA_DIR` relative to the checkout before starting the standalone
server. Docker supplies runtime variables through Compose instead.

Regression checks: `npm run lint`, `npm run test:projects`,
`npm run test:recovery`, and `npm audit`. Recovery tests create disposable data
and do not operate on the configured portfolio database.
