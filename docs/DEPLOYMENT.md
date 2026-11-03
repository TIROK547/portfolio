# Deployment

This app requires a host with a **persistent disk** — the SQLite database and uploaded images are written to `DATA_DIR` at runtime. Serverless platforms (Vercel, Netlify, Railway ephemeral) won't work.

## Prerequisites

On the VPS before running anything:

- Git
- Docker with Compose plugin (`docker compose`)
- Nginx
- Certbot (`python3-certbot-nginx`)
- Node.js 18+
- `curl`, `unzip`

For Debian/Ubuntu package commands, see [`INSTALL_DEPS.md`](INSTALL_DEPS.md).

---

## Automated VPS install

`scripts/install.sh` covers a full production install from scratch.  
Point both DNS records (`portfolio.<domain>` and `admin.<domain>`) at the VPS **before** running it.

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/TIROK547/portfolio/main/scripts/install.sh)
```

The script will interactively ask for:

- Base domain (it configures `portfolio.<domain>` and `admin.<domain>`)
- Install directory (default: `/opt/portfolio`)
- Admin username and password
- Optional backup ZIP to restore from
- Email address for Let's Encrypt

It then:

1. Generates `SESSION_SECRET` and `ADMIN_PASSWORD_HASH`, writes `.env`
2. Builds and starts the Docker Compose service
3. Configures Nginx to proxy both hostnames to `127.0.0.1:3000`
4. Obtains TLS certificates with Certbot

Re-running the script on an existing checkout pulls the latest version before rebuilding.

---

## Manual Docker deploy

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

The admin panel (`/backup` in the editor) can export a ZIP of both. Download and store it somewhere off the server. The install script's restore option accepts the same ZIP format.

---

## Updating

If installed via the install script, re-run it in the existing checkout — it pulls and rebuilds. For manual installs:

```bash
git pull
docker compose up -d --build
```

No migrations are needed for minor updates; the app creates tables on first start and adds columns as needed.
