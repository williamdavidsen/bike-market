#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
schedule="${BACKUP_CRON_SCHEDULE:-15 2 * * *}"
backup_dir="${BACKUP_DIR:-${HOME}/bikemarket-backups}"
log_file="${BACKUP_LOG_FILE:-${backup_dir}/backup.log}"
cron_start="# bikemarket database backup start"
cron_end="# bikemarket database backup end"
cron_command="cd ${repo_dir} && BACKUP_DIR=${backup_dir} bash scripts/deployment/run-database-backup.sh >> ${log_file} 2>&1"
cron_line="${schedule} ${cron_command}"

mkdir -p "${backup_dir}"

existing_cron="$(mktemp)"
next_cron="$(mktemp)"
trap 'rm -f "${existing_cron}" "${next_cron}"' EXIT

crontab -l > "${existing_cron}" 2>/dev/null || true

awk -v start="${cron_start}" -v end="${cron_end}" '
  $0 == start { skip = 1; next }
  $0 == end { skip = 0; next }
  skip != 1 { print }
' "${existing_cron}" > "${next_cron}"

{
  printf '%s\n' "${cron_start}"
  printf '%s\n' "${cron_line}"
  printf '%s\n' "${cron_end}"
} >> "${next_cron}"

crontab "${next_cron}"

printf 'Installed daily database backup cron:\n%s\n' "${cron_line}"
