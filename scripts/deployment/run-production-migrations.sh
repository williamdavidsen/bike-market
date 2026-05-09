#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"

if [[ ! -f "${env_file}" ]]; then
  echo "${env_file} is missing. Create and validate it before running migrations." >&2
  exit 1
fi

bash scripts/deployment/check-production-env.sh "${env_file}"
bash scripts/deployment/check-production-compose.sh "${env_file}" "${compose_file}"

docker compose --env-file "${env_file}" -f "${compose_file}" run --rm backend npm run db:migrate:deploy -w @bikemarket/backend
docker compose --env-file "${env_file}" -f "${compose_file}" run --rm backend npm run db:seed -w @bikemarket/backend

printf '\nProduction migrations and seed completed.\n'
