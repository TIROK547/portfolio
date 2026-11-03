#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Portfolio VPS installer
# One-liner: bash <(curl -fsSL https://raw.githubusercontent.com/TIROK547/portfolio/main/scripts/install.sh)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[tirok]${RESET} $*"; }
ok()   { echo -e "${GREEN}[✓]${RESET} $*"; }
warn() { echo -e "${YELLOW}[!]${RESET} $*"; }
die()  { echo -e "${RED}[✗]${RESET} $*" >&2; exit 1; }

echo -e "${BOLD}"
cat <<'EOF'
  ████████╗██╗██████╗  ██████╗ ██╗  ██╗
     ██╔══╝██║██╔══██╗██╔═══██╗██║ ██╔╝
     ██║   ██║██████╔╝██║   ██║█████╔╝
     ██║   ██║██╔══██╗██║   ██║██╔═██╗
     ██║   ██║██║  ██║╚██████╔╝██║  ██╗
     ╚═╝   ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
         portfolio installer
EOF
echo -e "${RESET}"

# ── 1. dependency checks ──────────────────────────────────────────────────────
log "Checking dependencies…"

need() {
  command -v "$1" &>/dev/null || die "$1 is required but not installed. Install it and re-run."
}

need git
need docker
need nginx
need certbot
need node

# docker compose (v2 plugin or standalone v1)
if docker compose version &>/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
else
  die "docker compose not found. Install Docker Compose v2 and re-run."
fi
ok "All dependencies found."

# ── 2. domain ─────────────────────────────────────────────────────────────────
echo
echo -e "${BOLD}Domain setup${RESET}"
read -rp "  Enter your base domain (e.g. tirok.ir): " BASE_DOMAIN
BASE_DOMAIN="${BASE_DOMAIN#http://}"; BASE_DOMAIN="${BASE_DOMAIN#https://}"; BASE_DOMAIN="${BASE_DOMAIN%%/*}"
[[ -z "$BASE_DOMAIN" ]] && die "Domain cannot be empty."
PORTFOLIO_DOMAIN="portfolio.${BASE_DOMAIN}"
ADMIN_DOMAIN="admin.${BASE_DOMAIN}"
log "Will configure: ${PORTFOLIO_DOMAIN} and ${ADMIN_DOMAIN}"

# ── 3. install dir ─────────────────────────────────────────────────────────────
echo
INSTALL_DIR="/opt/portfolio"
read -rp "  Install directory [${INSTALL_DIR}]: " _dir
INSTALL_DIR="${_dir:-$INSTALL_DIR}"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  log "Repo already exists at ${INSTALL_DIR}, pulling latest…"
  git -C "$INSTALL_DIR" pull
else
  log "Cloning repository into ${INSTALL_DIR}…"
  git clone https://github.com/TIROK547/portfolio.git "$INSTALL_DIR"
fi
cd "$INSTALL_DIR"

# ── 4. admin credentials ───────────────────────────────────────────────────────
echo
echo -e "${BOLD}Admin credentials${RESET}"
read -rp "  Admin username [admin]: " ADMIN_USER
ADMIN_USER="${ADMIN_USER:-admin}"

while true; do
  read -rsp "  Admin password: " ADMIN_PASS; echo
  read -rsp "  Confirm password: " ADMIN_PASS2; echo
  [[ "$ADMIN_PASS" == "$ADMIN_PASS2" ]] && break
  warn "Passwords don't match, try again."
done
[[ ${#ADMIN_PASS} -lt 8 ]] && die "Password must be at least 8 characters."

log "Generating session secret and password hash…"
HASH_OUTPUT=$(node scripts/hash-password.mjs "$ADMIN_PASS" 2>/dev/null) \
  || die "Failed to run hash-password.mjs — ensure Node.js 18+ is installed."

SESSION_SECRET=$(echo "$HASH_OUTPUT" | grep 'SESSION_SECRET=' | cut -d= -f2-)
ADMIN_PASSWORD_HASH=$(echo "$HASH_OUTPUT" | grep 'ADMIN_PASSWORD_HASH=' | cut -d= -f2-)

[[ -z "$SESSION_SECRET" || -z "$ADMIN_PASSWORD_HASH" ]] \
  && die "Could not parse hash-password.mjs output. Check scripts/hash-password.mjs."

# ── 5. restore? ────────────────────────────────────────────────────────────────
echo
RESTORE_FILE=""
read -rp "  Do you have a backup file to restore? [y/N]: " _restore
if [[ "${_restore,,}" == "y" ]]; then
  read -rp "  Path to backup zip: " RESTORE_FILE
  [[ ! -f "$RESTORE_FILE" ]] && die "File not found: $RESTORE_FILE"
  ok "Will restore from: $RESTORE_FILE"
fi

# ── 6. write .env ──────────────────────────────────────────────────────────────
log "Writing .env…"
cat > .env <<EOF
SESSION_SECRET=${SESSION_SECRET}
ADMIN_USER=${ADMIN_USER}
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
DATA_DIR=/data
NEXT_PUBLIC_SITE_URL=https://${PORTFOLIO_DOMAIN}
EOF
ok ".env written."

# ── 7. restore data before first boot ─────────────────────────────────────────
if [[ -n "$RESTORE_FILE" ]]; then
  log "Restoring backup before first boot…"
  # Find the Docker volume mount path
  VOLUME_NAME=$(basename "$INSTALL_DIR" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')_portfolio-data
  VOLUME_PATH="/var/lib/docker/volumes/${VOLUME_NAME}/_data"

  # Create volume dir if it doesn't exist yet
  mkdir -p "$VOLUME_PATH"

  TMP_RESTORE=$(mktemp -d)
  unzip -q "$RESTORE_FILE" -d "$TMP_RESTORE" || die "Failed to unzip backup."

  if [[ ! -f "$TMP_RESTORE/site.db" ]]; then
    rm -rf "$TMP_RESTORE"
    die "Invalid backup: site.db not found inside zip."
  fi

  cp "$TMP_RESTORE/site.db" "$VOLUME_PATH/site.db"
  if [[ -d "$TMP_RESTORE/uploads" ]]; then
    cp -r "$TMP_RESTORE/uploads" "$VOLUME_PATH/uploads"
  fi
  rm -rf "$TMP_RESTORE"
  ok "Backup restored to Docker volume."
fi

# ── 8. build & start container ────────────────────────────────────────────────
log "Building and starting Docker container…"
$COMPOSE up -d --build
ok "Container started."

# ── 9. wait for app to be ready ───────────────────────────────────────────────
log "Waiting for app to be ready on :3000…"
for i in $(seq 1 30); do
  curl -sf http://127.0.0.1:3000 -o /dev/null && break
  sleep 2
done
curl -sf http://127.0.0.1:3000 -o /dev/null || warn "App may not be ready yet — check 'docker compose logs'."

# ── 10. nginx config ──────────────────────────────────────────────────────────
log "Writing nginx configuration…"

NGINX_CONF="/etc/nginx/sites-available/portfolio"
cat > "$NGINX_CONF" <<NGINX
# portfolio — managed by install.sh
# Both subdomains proxy to the same Next.js app; it routes on the Host header.

upstream portfolio_app {
    server 127.0.0.1:3000;
    keepalive 8;
}

server {
    listen 80;
    server_name ${PORTFOLIO_DOMAIN} ${ADMIN_DOMAIN};
    client_max_body_size 10m;

    location / {
        proxy_pass         http://portfolio_app;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Forwarded-For   \$remote_addr;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
NGINX

# Enable site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/portfolio

nginx -t || die "nginx config test failed — check $NGINX_CONF"
systemctl reload nginx
ok "nginx configured and reloaded."

# ── 11. TLS via certbot ───────────────────────────────────────────────────────
log "Obtaining SSL certificates via certbot…"
read -rp "  Email for Let's Encrypt notifications: " CERT_EMAIL
[[ -z "$CERT_EMAIL" ]] && die "Email required for certbot."

certbot --nginx \
  -d "$PORTFOLIO_DOMAIN" \
  -d "$ADMIN_DOMAIN" \
  --non-interactive \
  --agree-tos \
  -m "$CERT_EMAIL" \
  --redirect

ok "SSL certificates installed."

# ── 12. done ──────────────────────────────────────────────────────────────────
echo
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║          Installation complete! 🎉           ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo
echo -e "  ${CYAN}Portfolio:${RESET}  https://${PORTFOLIO_DOMAIN}"
echo -e "  ${CYAN}Admin:${RESET}      https://${ADMIN_DOMAIN}"
echo
echo -e "  ${YELLOW}Tip:${RESET} run '${COMPOSE} logs -f' from ${INSTALL_DIR} to tail logs."
echo
