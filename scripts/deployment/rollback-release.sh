#!/usr/bin/env bash
set -euo pipefail

target_commit="${1:-}"
env_file="${2:-.env.production}"
compose_file="${3:-docker-compose.prod.yml}"

if [[ -z "${target_commit}" ]]; then
  echo "Usage: bash scripts/deployment/rollback-release.sh <commit-sha> [env_file] [compose_file]" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before rollback." >&2
  exit 1
fi

git cat-file -e "${target_commit}^{commit}"

echo "Creating database backup before rollback..."
bash scripts/deployment/run-database-backup.sh "${env_file}" "${compose_file}"

echo "Rolling back to ${target_commit}."
git checkout "${target_commit}"

docker compose --env-file "${env_file}" -f "${compose_file}" up -d --build
bash scripts/deployment/check-application-smoke.sh "${env_file}" "${compose_file}"

printf '\nRollback completed at %s.\n' "${target_commit}"
printf 'Return to main later with: git checkout main && git pull --ff-only\n'
