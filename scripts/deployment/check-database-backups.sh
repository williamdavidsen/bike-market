#!/usr/bin/env bash
set -euo pipefail

backup_dir="${BACKUP_DIR:-${HOME}/bikemarket-backups}"
max_age_hours="${BACKUP_MAX_AGE_HOURS:-24}"
failures=0

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

if [[ -d "${backup_dir}" ]]; then
  pass "backup directory exists: ${backup_dir}"
else
  fail "backup directory is missing: ${backup_dir}"
fi

latest_backup="$(find "${backup_dir}" -maxdepth 1 -type f -name 'bikemarket-*.sql' -printf '%T@ %p\n' 2>/dev/null | sort -nr | awk 'NR == 1 { print $2 }')"

if [[ -n "${latest_backup}" && -s "${latest_backup}" ]]; then
  pass "latest backup exists and is not empty: ${latest_backup}"
else
  fail "no non-empty bikemarket SQL backup found"
fi

if [[ -n "${latest_backup}" ]]; then
  if find "${latest_backup}" -mmin "-$((max_age_hours * 60))" | grep -Fq "${latest_backup}"; then
    pass "latest backup is newer than ${max_age_hours} hour(s)"
  else
    fail "latest backup is older than ${max_age_hours} hour(s)"
  fi
fi

if [[ "${failures}" -gt 0 ]]; then
  printf '\nDatabase backup check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nDatabase backup check passed.\n'
