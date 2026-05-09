#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.production}"
failures=0

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

pass() {
  printf 'PASS %s\n' "$1"
}

if [[ ! -f "${env_file}" ]]; then
  fail "${env_file} is missing"
  printf 'Create it with: cp .env.production.example .env.production\n' >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${env_file}"
set +a

required_vars=(
  NODE_ENV
  FRONTEND_URL
  BACKEND_URL
  FRONTEND_PORT
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  DATABASE_URL
  JWT_ACCESS_SECRET
  JWT_REFRESH_SECRET
  PAYMENT_PROVIDER
)

for var_name in "${required_vars[@]}"; do
  if [[ -n "${!var_name:-}" ]]; then
    pass "${var_name} is set"
  else
    fail "${var_name} is missing"
  fi
done

if [[ "${NODE_ENV:-}" == "production" ]]; then
  pass "NODE_ENV is production"
else
  fail "NODE_ENV must be production"
fi

if [[ "${FRONTEND_URL:-}" =~ ^https:// ]]; then
  pass "FRONTEND_URL uses HTTPS"
else
  fail "FRONTEND_URL must use HTTPS"
fi

if [[ "${BACKEND_URL:-}" =~ ^https://.*/api/?$ ]]; then
  pass "BACKEND_URL uses HTTPS and ends with /api"
else
  fail "BACKEND_URL must use HTTPS and end with /api"
fi

if [[ "${DATABASE_URL:-}" == *"@postgres:"* ]]; then
  pass "DATABASE_URL uses the compose postgres host"
else
  fail "DATABASE_URL must use host postgres inside the production compose network"
fi

if [[ "${POSTGRES_PASSWORD:-}" == *"replace-with"* || "${JWT_ACCESS_SECRET:-}" == *"replace-with"* || "${JWT_REFRESH_SECRET:-}" == *"replace-with"* ]]; then
  fail "Replace placeholder database password and JWT secrets before deployment"
else
  pass "Production secrets are not placeholder values"
fi

if [[ "${#POSTGRES_PASSWORD:-}" -ge 24 ]]; then
  pass "POSTGRES_PASSWORD length is acceptable"
else
  fail "POSTGRES_PASSWORD should be at least 24 characters"
fi

if [[ "${#JWT_ACCESS_SECRET:-}" -ge 32 && "${#JWT_REFRESH_SECRET:-}" -ge 32 ]]; then
  pass "JWT secret lengths are acceptable"
else
  fail "JWT secrets should be at least 32 characters"
fi

case "${PAYMENT_PROVIDER:-}" in
  mock | stripe | vipps | klarna)
    pass "PAYMENT_PROVIDER is supported"
    ;;
  *)
    fail "PAYMENT_PROVIDER must be one of: mock, stripe, vipps, klarna"
    ;;
esac

if [[ "${failures}" -gt 0 ]]; then
  printf '\nProduction environment check failed with %s issue(s).\n' "${failures}" >&2
  exit 1
fi

printf '\nProduction environment check passed.\n'
