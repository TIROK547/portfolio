#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Portfolio VPS installer (Ubuntu)
# On a new VPS:
#   sudo apt update && sudo apt upgrade -y
#   bash <(curl -fsSL https://raw.githubusercontent.com/TIROK547/portfolio/main/scripts/install.sh)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Re-exec via sudo keeps the prompts on the terminal. The temp copy is
# removed once root is reading it (Linux keeps the inode open).
if [[ "${1:-}" == "--elevated" ]]; then
  [[ -n "${2:-}" ]] && rm -f "$2"
  shift 2
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Root is required. Re-running with sudo…"
  tmp=$(mktemp)
  cat "$0" > "$tmp"
  chmod 700 "$tmp"
  exec sudo bash "$tmp" --elevated "$tmp"
fi

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[tirok]${RESET} $*"; }
ok()   { echo -e "${GREEN}[✓]${RESET} $*"; }
warn() { echo -e "${YELLOW}[!]${RESET} $*"; }
die()  { echo -e "${RED}[✗]${RESET} $*" >&2; exit 1; }

# Retry while unattended-upgrades or `apt upgrade` still holds the lock.
apt_get() {
  local attempt logf status
  for attempt in $(seq 1 12); do
    logf=$(mktemp)
    set +e
    DEBIAN_FRONTEND=noninteractive apt-get "$@" 2>&1 | tee "$logf"
    status=${PIPESTATUS[0]}
    set -e
    if [[ "$status" -eq 0 ]]; then
      rm -f "$logf"
      return 0
    fi
    if ! grep -qE 'Could not get lock|dpkg frontend lock|Unable to acquire the dpkg' "$logf"; then
      rm -f "$logf"
      return "$status"
    fi
    rm -f "$logf"
    warn "Package manager is busy. Retrying in 15s (${attempt}/12)…"
    sleep 15
  done
  return 1
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    systemctl enable --now docker
    ok "Docker with Compose is already installed."
    return
  fi

  if command -v docker >/dev/null 2>&1; then
    log "Docker is installed without the Compose plugin. Installing docker-compose-v2…"
    apt_get install -y docker-compose-v2 || die "Failed to install docker-compose-v2."
    systemctl enable --now docker
    docker compose version >/dev/null 2>&1 || die "Docker is installed but 'docker compose' is still unavailable."
    ok "Docker Compose plugin installed."
    return
  fi

  log "Installing Docker Engine and Compose…"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
  apt_get update || die "apt-get update failed after adding the Docker repository."
  apt_get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin \
    || die "Failed to install Docker Engine."
  systemctl enable --now docker
  local i
  for i in $(seq 1 30); do
    docker info >/dev/null 2>&1 && break
    sleep 1
  done
  docker info >/dev/null 2>&1 || die "Docker daemon did not start."
  docker compose version >/dev/null 2>&1 || die "docker compose is not available after install."
  ok "Docker Engine and Compose installed."
}

ensure_node() {
  local major
  if command -v node >/dev/null 2>&1; then
    major=$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)
    if [[ "$major" -ge 18 ]]; then
      ok "Node.js $(node -v) is already installed."
      return
    fi
    warn "Node.js $(node -v) is older than 18. Installing Node.js 22."
  else
    log "Installing Node.js 22…"
  fi

  local setup
  setup=$(mktemp)
  curl -fsSL https://deb.nodesource.com/setup_22.x -o "$setup"
  bash "$setup"
  rm -f "$setup"
  apt_get install -y nodejs || die "Failed to install Node.js."
  hash -r
  major=$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)
  [[ "$major" -ge 18 ]] || die "Node.js 18+ is required."
  ok "Node.js $(node -v) installed."
}

install_prereqs() {
  [[ -f /etc/os-release ]] || die "Cannot detect the OS. This installer supports Ubuntu."
  # shellcheck disable=SC1091
  . /etc/os-release
  [[ "${ID:-}" == "ubuntu" ]] || die "This installer supports Ubuntu. Detected: ${PRETTY_NAME:-unknown}."
  command -v systemctl >/dev/null 2>&1 || die "systemd is required (systemctl not found)."

  export DEBIAN_FRONTEND=noninteractive
  export NEEDRESTART_MODE=a

  log "Updating package lists…"
  apt_get update || die "apt-get update failed."

  log "Installing git, curl, unzip, nginx, and certbot…"
  apt_get install -y ca-certificates curl gnupg git unzip nginx certbot python3-certbot-nginx \
    || die "Failed to install base packages."
  systemctl enable --now nginx

  ensure_docker
  ensure_node
  hash -r

  command -v git >/dev/null 2>&1 || die "git was not installed."
  command -v nginx >/dev/null 2>&1 || die "nginx was not installed."
  command -v certbot >/dev/null 2>&1 || die "certbot was not installed."
  command -v node >/dev/null 2>&1 || die "node was not installed."
  command -v curl >/dev/null 2>&1 || die "curl was not installed."
  command -v unzip >/dev/null 2>&1 || die "unzip was not installed."

  if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
  else
    die "docker compose was not installed."
  fi
  ok "All dependencies are installed."
}

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

# ── 1. install dependencies ──────────────────────────────────────────────────
install_prereqs

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
  git clone --branch dev https://github.com/TIROK547/portfolio.git "$INSTALL_DIR"
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
