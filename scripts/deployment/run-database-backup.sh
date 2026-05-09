#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"
backup_dir="${BACKUP_DIR:-${HOME}/bikemarket-backups}"
timestamp="$(date +%F-%H%M%S)"
backup_file="${backup_dir}/bikemarket-${timestamp}.sql"

if [[ ! -f "${env_file}" ]]; then
  echo "${env_file} is missing. Create and validate it before taking a backup." >&2
  exit 1
fi

mkdir -p "${backup_dir}"

set -a
# shellcheck disable=SC1090
source "${env_file}"
set +a

docker compose --env-file "${env_file}" -f "${compose_file}" exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${backup_file}"

if [[ ! -s "${backup_file}" ]]; then
  echo "Backup file was not created or is empty: ${backup_file}" >&2
  exit 1
fi

printf 'Database backup written to %s\n' "${backup_file}"
