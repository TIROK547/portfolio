# Portfolio project review — 7 November 2026

Reviewed all 14 public repositories returned by the GitHub account API. Read README files and relevant implementation files from the nine original code repositories; checked the profile repository and compared all four forks with their upstream defaults. Repository code was inspected, not executed. This is a portfolio selection, not a security or production-readiness audit.

## Selection

| Repository / work | Decision | Evidence and emphasis |
| --- | --- | --- |
| [coxy](https://github.com/TIROK547/coxy) | Include, featured | README, CLI, collectors and delay-test scripts: concurrent Telegram collection, configuration/proxy testing, ranking. |
| [Televisit](https://github.com/TIROK547/Televisit) | Include, featured | README, appointments/views.py and chat/consumers.py: appointment lifecycle, Channels chat, API/frontend integration. Describe AI as experimental, without clinical claims. |
| [tt-music](https://github.com/TIROK547/tt-music) | Include | README, app.py, frontend assets: FastAPI/Telethon caching and streaming, JSON index, browser player, download-all endpoint. |
| [calcirok](https://github.com/TIROK547/calcirok) | Include, featured; combine calculator work | src/platform.cpp, src/main.cpp, input/arithmetic helpers and build configuration: freestanding C++, serial I/O, NOVA target. |
| [genode-calculator](https://github.com/TIROK547/genode-calculator) | Include within Calcirok detail | Qt5 Widgets source, arithmetic engine, CMake/toolchain/run files. Avoid claiming verified Genode deployment; the target was not built or run. |
| PasarGuard VPN infrastructure | Include, featured | Owner supplied: built VPNs using PasarGuard, multiple locations, tunnels. No claimed server count, geography, protocols, failover, uptime, throughput, or public source URL. |
| [telegram-study-bot](https://github.com/TIROK547/telegram-study-bot) | Include | README, WEB_PANEL_README, database.py, dependencies and web-panel package: study sessions, Jalali dates, SQLite, FastAPI, Next.js dashboard. Prefer implemented SQLite over stale README JSON references. |
| [portfolio](https://github.com/TIROK547/portfolio) | Include | Public repo plus current local implementation: Next.js, private CMS, SQLite, Markdown, galleries and README import. Current local enhancements are not necessarily on the public default branch yet. |
| [team-workspace](https://github.com/TIROK547/team-workspace) | Include as contribution, not original authorship | Fork is 7 commits ahead of upstream at review; 6 attributed to TIROK547, one to Amirxz007. Note model/signals/views/endpoint, integration and fixes. Credit upstream msmojtabafar/team-workspace. |
| [yt-dlp-fastapi](https://github.com/TIROK547/yt-dlp-fastapi) | Include as smaller supporting project | README and backend/main.py: extract/formats/health endpoints, metadata and direct URLs, small frontend. |
| [Os](https://github.com/TIROK547/Os) | Omit from selected work | README!.txt and main.py show a Python filesystem simulator, not a complete operating system. Useful early exercise, but the calculator projects provide a more distinctive systems story. |
| [TIROK547](https://github.com/TIROK547/TIROK547) | Omit | Profile README, not a standalone project. |
| [Bushuray-core](https://github.com/TIROK547/Bushuray-core) | Omit | 0 commits ahead of upstream default at review. No independent contribution demonstrated by this comparison. |
| [Bushuray-tui](https://github.com/TIROK547/Bushuray-tui) | Omit | 0 commits ahead of upstream default at review. |
| [cognee](https://github.com/TIROK547/cognee) | Omit | 0 commits ahead of upstream default at review. |

## Corrections to the previous list

TrendPulse, Kelaasor Panel, OTP Go, and LeetCode Solutions were not present in the current public repository inventory. Remove their old portfolio entries rather than retain unverified descriptions. The old generic study-bot description missed its actual study-time tracking and dashboard functionality. The old Os description overstated its scope.

## Editorial choices and limits

- Nine project entries represent eight original code repositories (the two calculators are grouped), one contribution fork, and the owner's VPN work.
- Four featured entries: Coxy, TeleVisit24, Calcirok, and PasarGuard infrastructure.
- `wip` is an editorial classification for prototype/experimental work (TeleVisit24, calculators, Team Workspace); other selected entries use `active`. These labels do not establish current deployment or maintenance commitments. None of the public repositories was GitHub-archived at review.
- Only the portfolio's live URL was verified reachable (HTTP 200). music.tirok.ir and televisit24.tirok.ir failed DNS resolution from this environment, so live buttons for those are left empty. A failed check does not prove permanent unavailability.
- The TeleVisit logo is an existing repository asset. No screenshots or logos were invented for other work.
- Descriptions are edited Markdown summaries, with links to the sources; they do not copy full READMEs into portfolio cards.

## Applying the selection

`lib/seed-projects.ts` is the curated source for new databases. Existing databases are never reset merely by deploying these content changes.

For an existing database with a configured `.env`:

```sh
node --env-file=.env --import tsx scripts/replace-projects.ts          # preview
node --env-file=.env --import tsx scripts/replace-projects.ts --apply  # back up and replace
```

The explicit replacement uses SQLite's backup API, writes a snapshot under `DATA_DIR/backups/`, and replaces only projects in one transaction. Blog posts, settings, comments, and uploads are preserved. Replacement IDs start above the previous maximum so old links cannot silently point to unrelated projects.

## Display order by portfolio value

Ranked for a backend/full-stack portfolio using implementation scope, technical depth, practical usefulness, and evidence of individual contribution:

1. TeleVisit24 — broadest application architecture and integration work.
2. Coxy — distinctive networking automation and a concrete end-to-end pipeline.
3. TIROK Music — cohesive, practical application with streaming, caching, and a complete interface.
4. Multi-location VPN Infrastructure — practical deployment and networking experience; details remain limited to the owner's description.
5. Calcirok — distinctive low-level C++ and microkernel exploration, with experimental scope.
6. Telegram Study Bot — useful bot, persistence, localization, and dashboard integration.
7. Terminal Portfolio & CMS — complete content workflow, but less distinctive than the projects above.
8. Team Workspace — valuable collaboration evidence, scoped to contributions to an existing platform.
9. YouTube Format Extraction API — useful supporting API project with a narrower implementation scope.

This is an editorial ranking, not a claim about revenue, user counts, or production reliability.
