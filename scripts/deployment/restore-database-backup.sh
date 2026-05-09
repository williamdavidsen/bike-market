#!/usr/bin/env bash
set -euo pipefail

backup_file="${1:-}"
env_file="${2:-.env.production}"
compose_file="${3:-docker-compose.prod.yml}"

if [[ -z "${backup_file}" ]]; then
  echo "Usage: bash scripts/deployment/restore-database-backup.sh <backup.sql> [env_file] [compose_file]" >&2
  exit 1
fi

if [[ ! -s "${backup_file}" ]]; then
  echo "Backup file is missing or empty: ${backup_file}" >&2
  exit 1
fi

if [[ ! -f "${env_file}" ]]; then
  echo "${env_file} is missing." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${env_file}"
set +a

echo "Restoring ${backup_file} into ${POSTGRES_DB}."
echo "This overwrites data visible to the target database connection."
read -r -p "Type RESTORE to continue: " confirmation

if [[ "${confirmation}" != "RESTORE" ]]; then
  echo "Restore cancelled."
  exit 1
fi

docker compose --env-file "${env_file}" -f "${compose_file}" exec -T postgres psql -U "${POSTGRES_USER}" "${POSTGRES_DB}" < "${backup_file}"

printf '\nDatabase restore completed.\n'
