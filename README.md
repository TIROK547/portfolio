# portfolio.tirok.ir

Personal portfolio site for Alireza Ghotbi (tirok) — retro terminal aesthetic, built with Next.js 15, TypeScript, and Tailwind CSS. Includes a private Markdown blog editor and dynamic site settings, all backed by SQLite.

Live at [portfolio.tirok.ir](https://portfolio.tirok.ir) · Editor at [admin.tirok.ir](https://admin.tirok.ir)

## Features

- **Blog** — Markdown posts with categories, tags, images, and comments; managed from the private editor at `admin.tirok.ir`
- **Dynamic site info** — bio, contact details, tech stack, skills, and availability are stored in SQLite and edited from the admin panel (no hardcoded content)
- **Projects** — managed from the editor, with ordering support; seeded once from `lib/seed-projects.ts`
- **Neofetch-style hero** — ASCII art with live system info pulled from site settings
- **Visitor counter** — session-based, starts at 547, stored in localStorage
- **Resume download** — one-click PDF download from the About page
- **i18n-ready routing** — pages live under `/[lang]/` (currently `en`)

## Tech Stack

| Layer    | Tech                                         |
|----------|----------------------------------------------|
| Frontend | Next.js 15 (App Router), React 18, TypeScript |
| Styling  | Tailwind CSS, Everforest color scheme, JetBrains Mono |
| Backend  | Next.js API routes, SQLite (`better-sqlite3`) |
| Auth     | scrypt password hash, signed httpOnly cookie  |
| Infra    | Docker, Nginx reverse proxy, VPS             |

## Project Structure

```
portfolio/
├── app/
│   ├── [lang]/         # Public pages: home, about, blog, projects, contact
│   ├── admin/          # Admin dashboard, editor, settings
│   ├── api/            # Blog, comments, admin and upload endpoints
│   └── uploads/        # Serves uploaded images
├── components/
│   ├── admin/          # Admin forms, lists, backup/restore UI
│   └── ...             # Shared public-site and blog components
├── lib/                # Database, auth, validation, settings defaults
├── scripts/            # Password utility, VPS installer
├── docs/               # Extended documentation (see below)
├── public/             # Static assets and downloadable resume
├── Dockerfile
├── docker-compose.yml
└── middleware.ts       # Host routing and admin access control
```

Runtime data (`site.db` and `uploads/`) lives under `DATA_DIR` and is not tracked in git.

## Getting Started

### Local development

```bash
npm install
node scripts/hash-password.mjs   # prints SESSION_SECRET + ADMIN_PASSWORD_HASH
cp .env.example .env              # paste the values in, set ADMIN_USER
# Add INSECURE_COOKIES=1 to .env for local http dev
npm run dev
```

Public site: `http://localhost:3000`  
Editor: `http://admin.localhost:3000`

### Environment variables

The minimum required set (see `.env.example` for all options):

| Variable              | Description                              |
|-----------------------|------------------------------------------|
| `SESSION_SECRET`      | Random secret for signing session cookies |
| `ADMIN_USER`          | Admin username                           |
| `ADMIN_PASSWORD_HASH` | scrypt hash — generate with `scripts/hash-password.mjs` |
| `DATA_DIR`            | Directory for `site.db` and `uploads/` (default: `./data`) |
| `INSECURE_COOKIES`    | Set to `1` for local http development    |

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full VPS, Docker, and reverse proxy instructions.

> **Note:** This app uses SQLite on disk. Serverless platforms (Vercel, Netlify) won't persist the database or uploaded images — deploy on a VPS or any host with a persistent disk volume.

## Documentation

| File | Contents |
|------|----------|
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | VPS install script, Docker Compose, Nginx config |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Host routing, blog/editor design, auth, comments, data model |
| [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) | Color scheme, fonts, visitor counter, adding static content |
| [`docs/INSTALL_DEPS.md`](docs/INSTALL_DEPS.md) | Extra npm packages required (`archiver`, `adm-zip`) |

## License

Personal portfolio — all rights reserved.  
Feel free to use this as inspiration, but don't copy the content directly.

## Contact

- **Email**: dev@tirok.ir
- **Telegram**: [@xyaes](https://t.me/xyaes)
- **GitHub**: [TIROK547](https://github.com/TIROK547)
