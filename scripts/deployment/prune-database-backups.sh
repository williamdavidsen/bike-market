#!/usr/bin/env bash
set -euo pipefail

backup_dir="${BACKUP_DIR:-${HOME}/bikemarket-backups}"
daily_days="${BACKUP_DAILY_RETENTION_DAYS:-14}"
weekly_weeks="${BACKUP_WEEKLY_RETENTION_WEEKS:-8}"
dry_run="${BACKUP_PRUNE_DRY_RUN:-0}"
now_epoch="$(date +%s)"
daily_cutoff_epoch="$((now_epoch - daily_days * 86400))"
weekly_cutoff_epoch="$((now_epoch - weekly_weeks * 7 * 86400))"

if [[ ! -d "${backup_dir}" ]]; then
  echo "Backup directory is missing: ${backup_dir}" >&2
  exit 1
fi

declare -A weekly_keep=()

while IFS= read -r -d '' backup_file; do
  backup_epoch="$(stat -c '%Y' "${backup_file}")"

  if (( backup_epoch >= daily_cutoff_epoch )); then
    continue
  fi

  if (( backup_epoch < weekly_cutoff_epoch )); then
    continue
  fi

  week_key="$(date -d "@${backup_epoch}" +%G-%V)"
  current_keep="${weekly_keep[${week_key}]:-}"

  if [[ -z "${current_keep}" || "${backup_epoch}" -gt "$(stat -c '%Y' "${current_keep}")" ]]; then
    weekly_keep["${week_key}"]="${backup_file}"
  fi
done < <(find "${backup_dir}" -maxdepth 1 -type f -name 'bikemarket-*.sql' -print0)

deleted_count=0
kept_count=0

while IFS= read -r -d '' backup_file; do
  backup_epoch="$(stat -c '%Y' "${backup_file}")"
  keep_file=0

  if (( backup_epoch >= daily_cutoff_epoch )); then
    keep_file=1
  elif (( backup_epoch >= weekly_cutoff_epoch )); then
    for weekly_file in "${weekly_keep[@]}"; do
      if [[ "${backup_file}" == "${weekly_file}" ]]; then
        keep_file=1
        break
      fi
    done
  fi

  if [[ "${keep_file}" -eq 1 ]]; then
    kept_count=$((kept_count + 1))
    continue
  fi

  if [[ "${dry_run}" == "1" ]]; then
    printf 'Would delete %s\n' "${backup_file}"
  else
    rm -f -- "${backup_file}"
    printf 'Deleted %s\n' "${backup_file}"
  fi
  deleted_count=$((deleted_count + 1))
done < <(find "${backup_dir}" -maxdepth 1 -type f -name 'bikemarket-*.sql' -print0)

printf 'Backup pruning complete. Kept %s file(s), removed %s file(s).\n' "${kept_count}" "${deleted_count}"
