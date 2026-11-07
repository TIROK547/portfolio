import type { ProjectInput } from './db'

// Curated from public repositories on 2026-11-07. See docs/project-review-2026-11-07.md.
// Used for fresh databases; existing databases change only through the explicit replacement script.
export type SeedProject = Omit<ProjectInput, 'sortOrder' | 'visibility'>

export const seedProjects: SeedProject[] = [
  {
    name: 'TeleVisit24',
    summary: 'A full-stack telemedicine prototype with appointment workflows, doctor profiles, real-time chat, and experimental AI service integrations.',
    description: `## Connected appointment and consultation workflows

TeleVisit24 combines a Django REST API with a Next.js frontend. The repository includes user accounts, doctor profiles, appointment management, and real-time messaging.

### Implemented areas

- Appointment creation, cancellation, rescheduling, confirmation, and completion endpoints.
- WebSocket chat through Django Channels, including typing indicators and read receipts.
- JWT authentication, PostgreSQL persistence, and Redis-backed channel infrastructure.
- Separate services and integration endpoints for experimental symptom prediction and emergency classification.
- Deployment configuration and documentation using Cloudflare Tunnel.

### Engineering focus

Coordinating frontend state, authenticated APIs, asynchronous chat, and separate services within one application. The AI components are prototype integrations; this portfolio does not claim clinical validation or production readiness.

[Explore the repository](https://github.com/TIROK547/Televisit).`,
    stack: ['Python', 'Django', 'Django REST Framework', 'Next.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Channels', 'Cloudflared'],
    github: 'https://github.com/TIROK547/Televisit', liveUrl: '',
    images: [{ url: 'https://raw.githubusercontent.com/TIROK547/Televisit/main/frontend/public/logos/televisit_logo_withtxt.png', alt: 'TeleVisit24 logo', kind: 'logo' }],
    status: 'wip', featured: true,
  },
  {
    name: 'Coxy',
    summary: 'A command-line pipeline that collects VPN configurations and proxies from Telegram, tests them, and produces ranked results.',
    description: `## From public channels to tested connections

Coxy brings collection, testing, and ranking into one command-line workflow. It gathers VLESS, VMess, and Trojan configurations alongside MTProto, HTTP, and SOCKS5 proxy links from public Telegram channels.

### What it does

- Collects from multiple channels concurrently with Telethon.
- Integrates xray-knife for configuration testing and Python checks for proxy liveness and latency.
- Produces raw outputs, test results, and a configurable top-N shortlist.
- Supports individual pipeline stages, proxy-assisted collection, and a full-run command.

### Engineering focus

Async collection, external-tool integration, and a repeatable data-processing pipeline. Test results describe the connection used for a run; they are not a guarantee of availability elsewhere.

[Read the source and usage guide](https://github.com/TIROK547/coxy).`,
    stack: ['Python', 'Bash', 'Telethon', 'Xray'],
    github: 'https://github.com/TIROK547/coxy', liveUrl: '', images: [], status: 'active', featured: true,
  },
  {
    name: 'TIROK Music',
    summary: 'A self-hosted music player that turns audio from a Telegram channel into a searchable, streamable library.',
    description: `## A Telegram channel as a music library

TIROK Music uses FastAPI and Telethon to index audio from a public Telegram channel, cache files on disk, and serve them through a browser-based player. Its frontend uses HTML, CSS, and JavaScript without a build step.

### Features

- Audio streaming with seeking, cover art, and background track preloading.
- Search, sorting, favorites, shuffle, repeat, and keyboard shortcuts.
- Media Session integration for playback controls outside the page.
- A streaming ZIP endpoint for downloading the library.
- Four visual themes, including terminal and study modes.

### Engineering focus

Media delivery, caching, and a responsive playback interface. The service uses a JSON index instead of a database and includes Docker Compose configuration, configurable visitor limits, and bounded concurrent ZIP downloads.

[View the source](https://github.com/TIROK547/tt-music).`,
    stack: ['Python', 'FastAPI', 'Telethon', 'JavaScript', 'Docker'],
    github: 'https://github.com/TIROK547/tt-music', liveUrl: '', images: [], status: 'active', featured: false,
  },
  {
    name: 'Multi-location VPN Infrastructure',
    summary: 'VPN deployments built with PasarGuard across multiple locations, with tunnels connecting the deployment infrastructure.',
    description: `## VPN deployment across multiple locations

I built VPN infrastructure using **PasarGuard**, with deployments in multiple locations and tunnels between parts of the setup.

### Scope of the work

- PasarGuard-based VPN deployments.
- Infrastructure spanning multiple locations.
- Tunnel configuration as part of the network setup.

This project represents hands-on infrastructure and networking work alongside my application projects.`,
    stack: ['PasarGuard', 'VPN', 'Networking', 'Tunneling'],
    github: '', liveUrl: '', images: [], status: 'active', featured: true,
  },
  {
    name: 'Calcirok — C++ & Microkernels',
    summary: 'Two calculator experiments: a freestanding C++ NOVA roottask and a Qt Widgets version targeting Genode/NOVA.',
    description: `## Exploring C++ at two levels

Calcirok is a pair of related calculator projects: one explores a minimal runtime and serial I/O, while the other adds a desktop interface and a Genode-oriented build configuration.

### Freestanding edition

The [calcirok repository](https://github.com/TIROK547/calcirok) contains a NOVA roottask target with its own entry point, linker script, input parser, arithmetic helpers, and COM1 serial platform layer. It avoids libc and the STL and uses x86 port I/O for terminal interaction.

### Qt / Genode edition

The [genode-calculator repository](https://github.com/TIROK547/genode-calculator) contains a C++17/Qt5 Widgets calculator with a separate arithmetic engine, keyboard controls, error handling, and CMake host/cross-build options. Genode/NOVA support is an experimental target represented by toolchain and run configuration.

### Engineering focus

Runtime constraints, platform boundaries, build tooling, and separating calculation logic from interface code. These are systems-programming experiments rather than a general-purpose operating system.`,
    stack: ['C++', 'Qt5', 'CMake', 'NOVA', 'Genode'],
    github: 'https://github.com/TIROK547/calcirok', liveUrl: '', images: [], status: 'wip', featured: true,
  },
  {
    name: 'Telegram Study Bot',
    summary: 'A Persian-friendly study tracker with pause/resume sessions, Jalali-calendar leaderboards, SQLite storage, and a web statistics dashboard.',
    description: `## Study sessions, shared progress

This Telegram bot helps study groups track time and compare progress. Users can start, pause, resume, and finish sessions, then view personal statistics and daily, weekly, or monthly rankings.

### Beyond the bot

- Persian interactions and Jalali calendar support.
- User profiles with field and grade information.
- Group membership checks and user-specific menu controls.
- SQLite-backed session and statistics storage.
- A FastAPI statistics API and a Next.js web panel with Persian/English support.

### Engineering focus

Session state, time aggregation, localization, and sharing one data layer between a bot and a web interface. The current database implementation uses SQLite; earlier README references to JSON describe an older version.

[Explore the bot and dashboard](https://github.com/TIROK547/telegram-study-bot).`,
    stack: ['Python', 'Telegram Bot API', 'SQLite', 'FastAPI', 'Next.js', 'TypeScript'],
    github: 'https://github.com/TIROK547/telegram-study-bot', liveUrl: '', images: [], status: 'active', featured: false,
  },
  {
    name: 'Terminal Portfolio & CMS',
    summary: 'This terminal-themed portfolio combines a Next.js public site with a private editor, Markdown publishing, and SQLite-backed content.',
    description: `## A portfolio with its own publishing workflow

This site pairs a terminal-inspired interface with a content management system. Projects and posts are stored in SQLite and managed through a private editor.

### Features

- English and Persian routes with responsive layouts.
- Markdown posts and project descriptions with a shared editing surface.
- Project galleries, stack/status filtering, featured work, and draft visibility.
- GitHub README import when a project description is empty.
- Image uploads, blog categories and tags, and comments.
- Separate public/admin host routing, authenticated editing, and backup/restore tools.

### Engineering focus

Building the complete content workflow: authoring, storage, presentation, and administration. Next.js and React handle the interface, with TypeScript, Tailwind CSS, and SQLite forming the application stack.

[Browse the repository](https://github.com/TIROK547/portfolio).`,
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SQLite', 'Docker'],
    github: 'https://github.com/TIROK547/portfolio', liveUrl: 'https://portfolio.tirok.ir', images: [], status: 'active', featured: false,
  },
  {
    name: 'Team Workspace — Contributions',
    summary: 'Contributions to a Django collaboration platform, including project notes, API integration, and backend/frontend fixes.',
    description: `## Contributing to a shared workspace

This is my contribution fork of [msmojtabafar/team-workspace](https://github.com/msmojtabafar/team-workspace), a Django collaboration platform with project management, task tracking, and live chat.

### My contribution area

The fork includes commits under my GitHub account that add a note model and signals, views, a notes endpoint, root URL integration, and subsequent backend/frontend fixes. The comparison also includes another contributor's project-note work.

### Engineering focus

Extending an existing codebase and connecting a new feature to its models, API, and interface. This entry represents collaborative contribution, with credit to the upstream project, rather than sole authorship of the platform.

[View my fork](https://github.com/TIROK547/team-workspace) · [Compare with upstream](https://github.com/msmojtabafar/team-workspace/compare/main...TIROK547:main).`,
    stack: ['Python', 'Django', 'Channels', 'JavaScript'],
    github: 'https://github.com/TIROK547/team-workspace', liveUrl: '', images: [], status: 'wip', featured: false,
  },
  {
    name: 'YouTube Format Extraction API',
    summary: 'A small FastAPI service that exposes yt-dlp metadata and direct media-format URLs through a REST API.',
    description: `## Media metadata through an API

This project wraps yt-dlp with FastAPI to inspect YouTube videos and return available audio/video formats and direct download URLs. It includes a small browser interface for selecting formats.

### Implemented endpoints

- \`/extract\` returns metadata and detailed format information.
- \`/formats\` provides a simpler format listing.
- \`/health\` exposes a basic service health check.

### Engineering focus

Turning a command-line/media extraction library into a structured HTTP service, with URL parsing and error responses. The API extracts links rather than downloading the media to its server. Availability depends on yt-dlp and the upstream service.

[Read the source](https://github.com/TIROK547/yt-dlp-fastapi).`,
    stack: ['Python', 'FastAPI', 'yt-dlp', 'JavaScript'],
    github: 'https://github.com/TIROK547/yt-dlp-fastapi', liveUrl: '', images: [], status: 'active', featured: false,
  },
]
