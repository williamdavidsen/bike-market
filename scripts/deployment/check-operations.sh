#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
compose_file="${2:-docker-compose.prod.yml}"
failures=0

pass() {
  printf 'PASS %s\n' "$1"
}

warn() {
  printf 'WARN %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

if [[ ! -f "${env_file}" ]]; then
  fail "${env_file} is missing"
  exit 1
fi

for service in backend frontend postgres; do
  if docker compose --env-file "${env_file}" -f "${compose_file}" ps --status running "${service}" | grep -Fq "${service}"; then
    pass "${service} is running"
  else
    fail "${service} is not running"
  fi

  if docker compose --env-file "${env_file}" -f "${compose_file}" logs --tail=20 "${service}" >/dev/null; then
    pass "${service} logs are readable"
  else
    fail "${service} logs are not readable"
  fi
done

disk_used_percent="$(df -P / | awk 'NR == 2 { gsub(/%/, "", $5); print $5 }')"
if [[ "${disk_used_percent}" -lt 85 ]]; then
  pass "root disk usage is ${disk_used_percent}%"
else
  fail "root disk usage is high: ${disk_used_percent}%"
fi

container_ids="$(docker compose --env-file "${env_file}" -f "${compose_file}" ps -q backend frontend postgres)"
for container_id in ${container_ids}; do
  restart_count="$(docker inspect --format '{{.RestartCount}}' "${container_id}")"
  container_name="$(docker inspect --format '{{.Name}}' "${container_id}" | sed 's#^/##')"
  if [[ "${restart_count}" -le 3 ]]; then
    pass "${container_name} restart count is ${restart_count}"
  else
    warn "${container_name} restart count is ${restart_count}"
  fi
done

if [[ "${failures}" -gt 0 ]]; then
  printf '\nOperations check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nOperations check passed.\n'
