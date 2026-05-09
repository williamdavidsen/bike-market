#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"
failures=0

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

if ! command -v docker >/dev/null 2>&1; then
  fail "docker is missing"
elif ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose plugin is missing"
else
  pass "Docker Compose plugin is available"
fi

if [[ ! -f "${env_file}" ]]; then
  fail "${env_file} is missing"
fi

if [[ ! -f "${compose_file}" ]]; then
  fail "${compose_file} is missing"
fi

if [[ "${failures}" -gt 0 ]]; then
  printf '\nProduction compose check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

config="$(docker compose --env-file "${env_file}" -f "${compose_file}" config)"

for service in postgres backend frontend; do
  if printf '%s\n' "${config}" | grep -Eq "^  ${service}:$"; then
    pass "${service} service is configured"
  else
    fail "${service} service is missing"
  fi
done

if printf '%s\n' "${config}" | grep -Fq "condition: service_healthy"; then
  pass "service health dependencies are configured"
else
  fail "service health dependencies are missing"
fi

if printf '%s\n' "${config}" | grep -Fq "4000/api/health"; then
  pass "backend healthcheck targets /api/health"
else
  fail "backend healthcheck is missing /api/health"
fi

if printf '%s\n' "${config}" | grep -Fq "target: 80"; then
  pass "frontend exposes container port 80"
else
  fail "frontend port mapping is missing target 80"
fi

if printf '%s\n' "${config}" | grep -Fq "postgres_data"; then
  pass "postgres_data volume is configured"
else
  fail "postgres_data volume is missing"
fi

if [[ "${failures}" -gt 0 ]]; then
  printf '\nProduction compose check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nProduction compose check passed.\n'
