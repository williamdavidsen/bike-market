#!/usr/bin/env bash
set -euo pipefail

domain="${1:-bikemarket.no}"
www_domain="${2:-www.${domain}}"
expected_ip="${EXPECTED_PUBLIC_IP:-}"
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

resolve_records() {
  local record_type="$1"
  local host_name="$2"

  if command -v dig >/dev/null 2>&1; then
    dig +short "${record_type}" "${host_name}"
  else
    getent ahosts "${host_name}" | awk '{ print $1 }' | sort -u
  fi
}

check_dns() {
  local host_name="$1"
  local a_records
  local aaaa_records

  a_records="$(resolve_records A "${host_name}" | sed '/^$/d' || true)"
  aaaa_records="$(resolve_records AAAA "${host_name}" | sed '/^$/d' || true)"
  if [[ -n "${a_records}${aaaa_records}" ]]; then
    pass "${host_name} has DNS address records"
    if [[ -n "${a_records}" ]]; then
      printf '%s\n' "${a_records}" | sed 's/^/  A /'
    fi
    if [[ -n "${aaaa_records}" ]]; then
      printf '%s\n' "${aaaa_records}" | sed 's/^/  AAAA /'
    fi
  else
    fail "${host_name} has no DNS address records"
    return
  fi

  if [[ -n "${expected_ip}" ]]; then
    if printf '%s\n' "${a_records}" | grep -Fxq "${expected_ip}"; then
      pass "${host_name} points to EXPECTED_PUBLIC_IP"
    else
      fail "${host_name} does not point to EXPECTED_PUBLIC_IP=${expected_ip}"
    fi
  else
    warn "EXPECTED_PUBLIC_IP is not set; skipping exact IP match for ${host_name}"
  fi
}

check_https() {
  local url="$1"
  local status

  status="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 15 "${url}" || true)"
  if [[ "${status}" =~ ^[23] ]]; then
    pass "${url} responds over HTTPS with HTTP ${status}"
  else
    fail "${url} did not return a successful HTTPS response"
  fi
}

require_command curl
if ! command -v dig >/dev/null 2>&1; then
  warn "dig is not installed; falling back to getent for DNS checks"
fi

check_dns "${domain}"
check_dns "${www_domain}"
check_https "https://${domain}/"

if [[ "${failures}" -gt 0 ]]; then
  printf '\nDomain and SSL check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nDomain and SSL check passed.\n'
