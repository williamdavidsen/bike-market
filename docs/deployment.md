# Bikemarket Deployment Guide

This guide describes a clean VPS deployment for the production Docker Compose stack.

## 1. Server Baseline

Recommended minimum VPS:

- Ubuntu 24.04 LTS
- 2 vCPU
- 4 GB RAM
- 40 GB SSD
- SSH access with a non-root deploy user

Install base packages:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git ufw
```

Or run the project baseline script on a fresh Ubuntu 24.04 VPS:

```bash
sudo bash scripts/deployment/server-baseline.sh
```

The script installs the base packages, configures Docker's official apt repository, installs Docker Engine with the
Compose plugin, enables Docker, and applies the firewall baseline below. If you prefer manual setup, install Docker
Engine and the Compose plugin from Docker's official repository, then verify:

```bash
docker --version
docker compose version
```

Firewall baseline:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Check the baseline before moving to domain and SSL:

```bash
bash scripts/deployment/check-server-baseline.sh
```

## 2. Domain And SSL

Create DNS records:

- `A bikemarket.no -> VPS public IPv4`
- `A www.bikemarket.no -> VPS public IPv4`
- Optional `AAAA` records if IPv6 is configured

Use a reverse proxy such as Caddy, Traefik, or Nginx with Certbot in front of the frontend container. The production
compose file exposes the frontend on `${FRONTEND_PORT:-80}`. For a simple Caddy setup, proxy `bikemarket.no` to
`127.0.0.1:80` and let Caddy issue Let's Encrypt certificates automatically.

A minimal Caddy example is available at `deploy/caddy/Caddyfile`. Copy it to `/etc/caddy/Caddyfile` after Caddy is
installed, then reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Check DNS and HTTPS before moving to application setup:

```bash
EXPECTED_PUBLIC_IP=<VPS public IPv4> bash scripts/deployment/check-domain-ssl.sh
```

Run the full pre-application gate after sections 1 and 2 are complete:

```bash
EXPECTED_PUBLIC_IP=<VPS public IPv4> bash scripts/deployment/check-pre-app-setup.sh
```

## 3. Application Setup

Clone and configure:

```bash
git clone https://github.com/williamdavidsen/bike-market.git
cd bike-market
cp .env.production.example .env.production
nano .env.production
```

Validate the production environment file before building containers:

```bash
bash scripts/deployment/check-production-env.sh
bash scripts/deployment/check-production-compose.sh
```

Required environment variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Must be `production` |
| `FRONTEND_URL` | Public site URL, for CORS |
| `BACKEND_URL` | Public API URL |
| `FRONTEND_PORT` | Host port exposed by frontend container |
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Long random database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Backend Prisma connection string using host `postgres` |
| `JWT_ACCESS_SECRET` | Long random access-token secret |
| `JWT_REFRESH_SECRET` | Long random refresh-token secret |
| `PAYMENT_PROVIDER` | `mock` until a real provider is configured |
| `STRIPE_SECRET_KEY` | Stripe secret when enabled |
| `VIPPS_CLIENT_ID` | Vipps client id when enabled |
| `VIPPS_CLIENT_SECRET` | Vipps client secret when enabled |
| `KLARNA_USERNAME` | Klarna username when enabled |
| `KLARNA_PASSWORD` | Klarna password when enabled |

Start the stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Run migrations and seed data:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend npm run db:migrate:deploy -w @bikemarket/backend
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend npm run db:seed -w @bikemarket/backend
bash scripts/deployment/run-production-migrations.sh
```

Smoke checks:

```bash
curl -fsS https://bikemarket.no/
curl -fsS https://bikemarket.no/api/health
docker compose --env-file .env.production -f docker-compose.prod.yml ps
bash scripts/deployment/check-application-smoke.sh
```

Run the full gate before continuing to the database backup plan:

```bash
npm run deploy:check:pre-backup
```

## 4. Database Backup Plan

Create a daily backup directory:

```bash
mkdir -p ~/bikemarket-backups
```

Manual backup:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > ~/bikemarket-backups/bikemarket-$(date +%F-%H%M).sql
```

Restore drill:

```bash
cat ~/bikemarket-backups/bikemarket-YYYY-MM-DD-HHMM.sql | docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

Retention target:

- Daily backups for 14 days
- Weekly backups for 8 weeks
- Copy at least one backup off-server
- Test restore before major releases

## 5. Logs And Operations

View logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
```

Operational checks:

- Backend health: `/api/health`
- Frontend health: `/`
- Disk usage: `df -h`
- Container state: `docker compose --env-file .env.production -f docker-compose.prod.yml ps`
- Failed restarts: `docker inspect --format '{{.RestartCount}}' <container>`

## 6. Updates

Deploy an update:

```bash
git fetch origin
git checkout main
git pull --ff-only
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend npm run db:migrate:deploy -w @bikemarket/backend
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
curl -fsS https://bikemarket.no/api/health
```

## 7. Rollback

Rollback logic:

1. Identify the last known good commit: `git log --oneline`.
2. Create a database backup before changing anything.
3. Check out the previous commit: `git checkout <commit-sha>`.
4. Rebuild and restart: `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.
5. Verify `/api/health`, frontend load, login, product list, cart, checkout start, and mock payment.

Database migrations should be backward-compatible where possible. If a migration is destructive, prepare a tested restore
from backup before deploying it.
