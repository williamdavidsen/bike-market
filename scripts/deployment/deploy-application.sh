#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"

if [[ ! -f "${env_file}" ]]; then
  echo "${env_file} is missing. Create it from .env.production.example before deploying." >&2
  exit 1
fi

bash scripts/deployment/check-production-env.sh "${env_file}"
bash scripts/deployment/check-production-compose.sh "${env_file}" "${compose_file}"

docker compose --env-file "${env_file}" -f "${compose_file}" build
docker compose --env-file "${env_file}" -f "${compose_file}" up -d postgres

bash scripts/deployment/run-production-migrations.sh "${env_file}" "${compose_file}"

docker compose --env-file "${env_file}" -f "${compose_file}" up -d
bash scripts/deployment/check-application-smoke.sh "${env_file}" "${compose_file}"

printf '\nApplication setup completed. The production stack is running and smoke checks passed.\n'
