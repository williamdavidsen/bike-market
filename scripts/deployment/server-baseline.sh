#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo: sudo bash scripts/deployment/server-baseline.sh" >&2
  exit 1
fi

if [[ -r /etc/os-release ]]; then
  # shellcheck disable=SC1091
  source /etc/os-release
fi

if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "This baseline script is intended for Ubuntu 24.04 LTS." >&2
  exit 1
fi

if [[ "${VERSION_ID:-}" != "24.04" ]]; then
  echo "Warning: expected Ubuntu 24.04 LTS, found ${PRETTY_NAME:-unknown OS}." >&2
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl git ufw gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

architecture="$(dpkg --print-architecture)"
codename="$(
  . /etc/os-release
  echo "${VERSION_CODENAME}"
)"

cat > /etc/apt/sources.list.d/docker.list <<EOF
deb [arch=${architecture} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${codename} stable
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

docker --version
docker compose version
ufw status verbose
