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

if [[ ! -f "${env_file}" ]]; then
  fail "${env_file} is missing"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${env_file}"
set +a

check_url() {
  local url="$1"
  local label="$2"
  local status

  status="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 20 "${url}" || true)"
  if [[ "${status}" =~ ^[23] ]]; then
    pass "${label} returned HTTP ${status}"
  else
    fail "${label} did not return a successful response from ${url}"
  fi
}

check_url "${FRONTEND_URL:-}" "frontend"
check_url "${BACKEND_URL:-}/health" "backend health"

if docker compose --env-file "${env_file}" -f "${compose_file}" ps --status running | grep -Eq 'backend|frontend|postgres'; then
  pass "production compose services are running"
else
  fail "production compose services are not running"
fi

if docker compose --env-file "${env_file}" -f "${compose_file}" ps | grep -Fq "unhealthy"; then
  fail "one or more compose services are unhealthy"
else
  pass "compose services do not report unhealthy status"
fi

if [[ "${failures}" -gt 0 ]]; then
  printf '\nApplication smoke check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nApplication smoke check passed.\n'
