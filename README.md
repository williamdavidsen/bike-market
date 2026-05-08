# Sykkelix

Sykkelix is a Norwegian bicycle e-commerce platform built as a TypeScript monorepo.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma
- Validation: Zod
- Auth: JWT and refresh tokens
- Payments: provider-based architecture for mock, Stripe, Vipps, and Klarna-ready flows
- Tests: Node test runner now; Jest, Supertest, React Testing Library, and Playwright will be added as the app grows
- Deployment: Docker and Docker Compose

## Monorepo Structure

```txt
apps/
  backend/
  frontend/
packages/
  shared/
tests/
```

## Stage 1

This stage creates the repository foundation:

- npm workspaces
- frontend and backend app placeholders
- shared package placeholder
- environment examples
- test folder with a structure verification test

## Stage 3

This stage adds the local PostgreSQL development database:

- Docker Compose PostgreSQL service
- root `.env` values for local Docker development
- backend `DATABASE_URL` validation
- backend database connection check script

## Stage 4

This stage adds Prisma as the database schema layer:

- Prisma schema for the first e-commerce models
- PostgreSQL datasource configuration
- migration and Prisma Client generation scripts
- seed script with initial category, brand, product, variant, image, and inventory data

## Stage 5

This stage locks in backend code quality and API standards:

- ESLint and Prettier configuration
- strict TypeScript checks
- standard success and error response helpers
- central application error classes
- async controller wrapper
- Zod request validation middleware
- structured logger utility

## Stage 6

This stage adds the authentication system:

- register, login, refresh, logout, and current user endpoints
- bcrypt password hashing
- JWT access and refresh tokens
- persisted refresh token hashes
- authentication and role authorization middleware
- `CUSTOMER` and `ADMIN` role support

## Stage 7

This stage adds the product catalog backend:

- product, category, and brand APIs
- admin-only create, update, and delete routes
- product variants, images, and inventory in product responses
- filtering, sorting, and pagination for product listings

## Stage 8

This stage adds the authenticated cart backend:

- current user cart retrieval and creation
- add, update, remove, and clear cart item flows
- backend price recalculation for cart totals
- stock checks before quantity changes

## Stage 9

This stage adds checkout and order creation:

- checkout start endpoint
- authenticated order listing and detail endpoints
- backend price, MVA, shipping, and total calculation
- order item snapshots
- inventory reserved stock updates
- transaction-based checkout guardrails

## Stage 10

This stage adds payment provider architecture:

- provider-neutral payment interface
- mock payment provider
- Stripe and Vipps provider placeholders
- payment session creation during checkout
- payment webhook endpoint
- webhook idempotency and PaymentEvent storage
- admin refund endpoint
- paid webhook stock capture from reserved inventory

## Stage 11

This stage adds the frontend foundation:

- Vite React TypeScript app setup
- Tailwind CSS
- React Router
- Zustand
- TanStack Query
- typed fetch API client
- environment config
- responsive layout shell
- Home and NotFound pages
- placeholder routes for the next frontend stages

## Stage 12

This stage adds the shared frontend catalog layer:

- backend-backed product, category, and brand queries
- ProductListPage with grid, loading, empty, and error states
- CategoryPage reusing the same catalog behavior
- ProductCard with image, brand, price, sale price, stock badge, and add-to-cart state
- desktop filter sidebar and mobile filter drawer
- sort and pagination controls
- URL query sync for filters, sorting, and pagination

## Commands

```bash
npm test
```

Quality gate:

```bash
npm test
npm run lint
npm run format
```

## Production Preparation

Build and run the production stack with Docker Compose:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Run database migrations and seed data against the production compose network:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend npm run db:migrate:deploy -w @sykkelix/backend
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend npm run db:seed -w @sykkelix/backend
```

Health checks:

- Backend: `GET /api/health`
- Frontend: `GET /`
- PostgreSQL: `pg_isready` in the compose healthcheck

Full server deployment steps are documented in [docs/deployment.md](docs/deployment.md).

QA strategy:

```txt
docs/qa-test-strategy.md
```

Frontend expectations:

```txt
docs/frontend-expectations.md
```

Stage-specific test:

```bash
npm run test:stage1
```

Start PostgreSQL:

```bash
docker compose up -d
```

Check backend database connectivity:

```bash
npm run db:check -w @sykkelix/backend
```

Run Prisma migration and seed:

```bash
npm run db:migrate -w @sykkelix/backend -- --name init_ecommerce_schema
npm run db:seed -w @sykkelix/backend
```

Check backend quality standards:

```bash
npm run lint -w @sykkelix/backend
npm run format -w @sykkelix/backend
npm run test:stage5
```

Check authentication:

```bash
npm run test:stage6
```

Check catalog APIs:

```bash
npm run test:stage7
```

Check cart APIs:

```bash
npm run test:stage8
```

Check checkout and order APIs:

```bash
npm run test:stage9
```

Check payment APIs:

```bash
npm run test:stage10
```

Check frontend foundation:

```bash
npm run test:stage11
```

Check frontend catalog:

```bash
npm run test:stage12
```

Check frontend product listing and filtering:

```bash
npm run test:stage13
```

Check frontend product detail:

```bash
npm run test:stage14
```

Check frontend cart:

```bash
npm run test:stage15
```

Check frontend checkout:

```bash
npm run test:stage16
```

Check frontend admin panel:

```bash
npm run test:stage17
```

Run frontend locally:

```bash
npm run dev -w @sykkelix/frontend
```

## Development Notes

The project will be built step by step. Each stage must leave the repository in a working and testable state before the next stage begins.
