#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

printf 'Checking server baseline...\n'
bash "${script_dir}/check-server-baseline.sh"

printf '\nChecking domain and SSL...\n'
bash "${script_dir}/check-domain-ssl.sh"

printf '\nPre-application setup checks passed. You can continue to deployment step 3.\n'
