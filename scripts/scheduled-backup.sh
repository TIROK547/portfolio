#!/usr/bin/env bash
# Configure BACKUP_DEST as an SSH rsync destination in /etc/tirok-backup.env.
set -euo pipefail
: "${BACKUP_DEST:?Set BACKUP_DEST to an off-server rsync destination}"
/usr/local/bin/tirok backup
rsync -az --protect-args /var/backups/tirok/ "${BACKUP_DEST%/}/"
