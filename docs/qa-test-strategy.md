# Sykkelix QA Test Strategy

## Guiding Principle

Sykkelix testleri once API ve veri guvenligini, sonra frontend davranisini, en son uctan uca akislarini kanitlar. E-ticarette en pahali hatalar yanlis fiyat, yanlis stok, yetkisiz admin erisimi, cift odeme, webhook tekrar isleme ve secret sizintisidir.

## Test Pyramid

| Layer | Scope | Tools | Runs In CI |
| --- | --- | --- | --- |
| Static checks | TypeScript, lint, format, secrets, config | TypeScript, ESLint, Prettier, node:test | Every push |
| Unit tests | Pure helpers, validation, token/password utilities | node:test | Every push |
| API tests | Express endpoints, auth, catalog, cart | Supertest, node:test | Every push |
| Integration tests | Prisma, Postgres, migrations, seed | Prisma CLI, Docker Compose | Pull request / pre-release |
| Component tests | React UI behavior | React Testing Library | Frontend stages |
| E2E tests | Register to checkout/payment/order | Playwright | Main branch / release |
| Security tests | OWASP API abuse, auth bypass, webhook replay | Supertest, static checks, later SAST | Every push where practical |
| Performance tests | API baseline, N+1 risk, checkout concurrency | Later load tooling | Pre-release |

## Current Automated Commands

```bash
npm test
npm run lint
npm run format
npm run test:stage8
```

`npm test` is the regression gate for all completed stages. Every new stage must add a `tests/stage-N.*.test.mjs` file and keep prior stages green.

## Stage Coverage Matrix

| Stage | Required Test Focus | Current Automation |
| --- | --- | --- |
| 1 Monorepo | Workspace shape, env examples, secret ignore rules | `tests/stage-1.structure.test.mjs` |
| 2 Backend foundation | Health API, error format, security middleware, strict TS | `tests/stage-2.backend.test.mjs`, backend API tests |
| 3 Docker/Postgres | Compose service, healthcheck, env values, no real secrets | `tests/stage-3.docker-postgres.test.mjs` |
| 4 Prisma | Models, unique constraints, FK/cascade intent, decimal prices | `tests/stage-4.prisma.test.mjs` |
| 5 Backend standards | ESLint, Prettier, Zod validation, async wrapper, logger | `tests/stage-5.backend-standards.test.mjs`, backend validation tests |
| 6 Auth | bcrypt, JWT, refresh rotation, logout, role checks | `tests/stage-6.auth.test.mjs`, backend auth tests |
| 7 Catalog | CRUD route surface, filters, pagination, admin-only | `tests/stage-7.catalog.test.mjs`, backend catalog tests |
| 8 Cart | State transitions, stock checks, backend price calculation | `tests/stage-8.cart.test.mjs`, backend cart tests |
| 9 Checkout/Order | Transactions, empty cart block, stock reserve, MVA, snapshots | `tests/stage-9.checkout-order.test.mjs`, backend checkout tests |
| 10 Payment | Signature validation, idempotency, replay, status transitions | `tests/stage-10.payment-provider.test.mjs`, backend payment tests |
| 11 Frontend foundation | Vite, routing, layout, API client, providers, responsive shell | `tests/stage-11.frontend-foundation.test.mjs`, frontend build |
| 12 Frontend catalog | Product grid, filter/sort/pagination, URL query sync, loading/empty/error state | `tests/stage-12.frontend-catalog.test.mjs`, frontend build |
| 13 Product listing/filtering | Sticky filters, mobile drawer, sort choices, URL persistence | `tests/stage-13.frontend-product-filtering.test.mjs`, frontend build |
| 14 Product detail | Slug detail, gallery, variant selection, stock gate, add-to-cart | `tests/stage-14.frontend-product-detail.test.mjs`, frontend build |
| 15 Cart frontend | Backend cart sync, quantity update, remove, summary, MVA, shipping estimate | `tests/stage-15.frontend-cart.test.mjs`, frontend build |
| 16 Checkout frontend | Address form, delivery/payment selection, checkout start, mock payment result pages | `tests/stage-16.frontend-checkout.test.mjs`, frontend build |
| 17 Admin panel | Admin-only routes, dashboard, product/category/brand CRUD, order list/refund action | `tests/stage-17.frontend-admin.test.mjs`, frontend build |
| 18 Test hardening | Full regression, flake review, CI strategy | To be expanded |
| 19 Norway modules | NOK, MVA, GDPR, Norwegian copy | To be added with modules |
| 20-21 Production | Docker build, healthcheck, env, rollback docs | To be added with deployment |

## Risk-Based Rules

- Frontend price input must never be trusted.
- Cart, checkout, tax, shipping, and order totals must be recalculated in the backend.
- Stock must be checked in backend cart and again during checkout.
- Checkout/order creation must use database transactions.
- Payment webhooks must verify signatures and be idempotent.
- Refresh token rotation and logout invalidation must be tested.
- CUSTOMER must never access admin endpoints.
- Passwords must be bcrypt hashed and never stored in plain text.
- Zod validation must guard every external input.
- Error responses must keep the standard API format.
- Secrets and production credentials must never be committed.

## Exit Criteria For Every Stage

- Stage-specific tests exist and are included in `npm test`.
- Happy path, negative path, and at least one edge/security case are automated for new API behavior.
- `npm test`, `npm run lint`, and `npm run format` pass.
- No hardcoded production secret or credential is introduced.
- README or docs mention new stage commands and responsibilities.
- Existing completed stages remain green.

## Future Mandatory Critical Tests

- Register -> login -> add to cart -> checkout -> payment -> order E2E.
- Duplicate payment webhook does not process the same event twice.
- Invalid webhook signature is rejected.
- Two simultaneous checkout attempts cannot oversell stock.
- Customer cannot read another user's cart/order.
- NOK and MVA calculations match Norwegian business rules.
- Docker Compose starts backend, frontend, and database with healthy checks.
