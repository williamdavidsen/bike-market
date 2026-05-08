#!/usr/bin/env bash
set -euo pipefail

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

require_command() {
  local command_name="$1"

  if command -v "${command_name}" >/dev/null 2>&1; then
    pass "${command_name} is installed"
  else
    fail "${command_name} is missing"
  fi
}

if [[ -r /etc/os-release ]]; then
  # shellcheck disable=SC1091
  source /etc/os-release
else
  fail "/etc/os-release is not readable"
fi

if [[ "${ID:-}" == "ubuntu" && "${VERSION_ID:-}" == "24.04" ]]; then
  pass "Ubuntu 24.04 LTS detected"
else
  fail "Expected Ubuntu 24.04 LTS, found ${PRETTY_NAME:-unknown OS}"
fi

cpu_count="$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 0)"
if [[ "${cpu_count}" -ge 2 ]]; then
  pass "CPU count is ${cpu_count}"
else
  fail "Expected at least 2 CPU cores, found ${cpu_count}"
fi

memory_kb="$(awk '/MemTotal/ { print $2 }' /proc/meminfo 2>/dev/null || echo 0)"
if [[ "${memory_kb}" -ge 3900000 ]]; then
  pass "Memory is at least 4 GB"
else
  fail "Expected at least 4 GB RAM"
fi

root_disk_gb="$(df -BG / | awk 'NR == 2 { gsub(/G/, "", $2); print $2 }')"
if [[ "${root_disk_gb}" -ge 40 ]]; then
  pass "Root disk is at least 40 GB"
else
  fail "Expected at least 40 GB root disk"
fi

for command_name in ca-certificates curl git ufw docker; do
  require_command "${command_name}"
done

if docker compose version >/dev/null 2>&1; then
  pass "Docker Compose plugin is installed"
else
  fail "Docker Compose plugin is missing"
fi

if systemctl is-enabled docker >/dev/null 2>&1 && systemctl is-active docker >/dev/null 2>&1; then
  pass "Docker service is enabled and active"
else
  fail "Docker service is not enabled and active"
fi

if ufw status | grep -qi '^Status: active'; then
  pass "UFW is active"
else
  fail "UFW is not active"
fi

for rule in OpenSSH '80/tcp' '443/tcp'; do
  if ufw status | grep -Fq "${rule}"; then
    pass "UFW allows ${rule}"
  else
    fail "UFW is missing ${rule}"
  fi
done

if [[ "${failures}" -gt 0 ]]; then
  printf '\nServer baseline check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nServer baseline check passed.\n'
