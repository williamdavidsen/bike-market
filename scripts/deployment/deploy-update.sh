#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"
branch="${DEPLOY_BRANCH:-main}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before deploying." >&2
  exit 1
fi

git fetch origin
git checkout "${branch}"
git pull --ff-only origin "${branch}"

bash scripts/deployment/check-production-env.sh "${env_file}"
bash scripts/deployment/check-production-compose.sh "${env_file}" "${compose_file}"

docker compose --env-file "${env_file}" -f "${compose_file}" build
bash scripts/deployment/run-production-migrations.sh "${env_file}" "${compose_file}"
docker compose --env-file "${env_file}" -f "${compose_file}" up -d
bash scripts/deployment/check-application-smoke.sh "${env_file}" "${compose_file}"

printf '\nDeployment update completed for %s.\n' "${branch}"
