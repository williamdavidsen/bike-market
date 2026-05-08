# Sykelix Frontend Expectations

## Working Agreement

When frontend stages begin, implementation must combine:

- the current stage requirements,
- the existing repository and backend contract,
- this frontend expectations document.

The goal is not just to complete pages, but to build a professional Norwegian bicycle e-commerce frontend that feels trustworthy, fast, simple, and production-ready.

## Product Vision

Sykelix is a modern bicycle e-commerce platform for the Norwegian market.

Primary categories:

- Sykkel
- Elsykkel
- Barnesykkel
- Sykkelhjelm
- Sykkelklær
- Reservedeler
- Tilbehør
- Lås
- Lys
- Dekk
- Service
- Kampanjeprodukter

The frontend must be in Norwegian and use NOK formatting, for example `12 990 kr`. MVA must be visible where relevant.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- React Router
- Axios or typed fetch client
- React Testing Library
- Playwright

## Backend Contract

Base API URL must come from:

```txt
VITE_API_URL=http://localhost:4000/api
```

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

The frontend must normalize API errors and never show backend stack traces.

## Design Direction

- Modern Scandinavian / Nordic feel
- Clean white backgrounds
- Light grey page sections
- Trustworthy dark navy or black text
- Energetic but restrained green or blue accents
- Large readable headings
- Generous spacing
- Soft corners
- Modern product cards
- Minimal shadow usage
- Mobile-first responsive design
- Professional e-commerce look
- Strong but not cluttered hero area
- Modern icons
- Clean product imagery
- Tasteful placeholder images when product imagery is missing

The frontend should feel like a real modern Norwegian bicycle shop, not a student project.

## Norwegian UI Copy

Use Norwegian UI text, including:

- Legg i handlekurv
- Se produkter
- På lager
- Få igjen
- Utsolgt
- Hent i butikk
- Sendes hjem
- Gratis frakt over 999 kr
- Trygg betaling
- Rask levering
- Enkel retur
- Norsk kundeservice
- Mine bestillinger
- Logg inn
- Registrer deg
- Handlekurv
- Gå til kassen
- Betaling
- Levering
- Ordrebekreftelse

## Required Pages

- HomePage
- ProductListPage
- CategoryPage
- ProductDetailPage
- CartPage
- CheckoutPage
- PaymentSuccessPage
- PaymentFailedPage
- LoginPage
- RegisterPage
- AccountPage
- OrdersPage
- OrderDetailPage
- AdminDashboard
- AdminProducts
- AdminProductForm
- AdminOrders
- AdminCategories
- NotFoundPage
- PrivacyPolicyPage
- TermsPage

## Core Layout And Components

Required layout/components:

- AppLayout
- Header
- MobileHeader
- SearchBar
- CategoryNavigation
- Footer
- Breadcrumb
- CartDrawer
- ProtectedRoute
- AdminRoute
- PageContainer
- SectionTitle
- ProductCard
- ProductGrid
- ProductSkeleton
- EmptyState
- ErrorState
- LoadingSpinner
- Badge
- Button
- Input
- Select
- Modal / Drawer
- Toast notification system
- CookieBanner
- Price
- StockBadge

Header requirements:

- Logo: Sykelix
- Search bar
- Category navigation
- Login/account link
- Cart icon
- Mobile hamburger menu
- Admin link only visible for ADMIN users

## Page Requirements

### HomePage

- Modern hero section focused on bicycle / elsykkel shopping
- Primary CTAs
- Category cards
- Campaign banner
- Popular products
- New products
- Trust blocks: Trygg betaling, Rask levering, Enkel retur, Norsk kundeservice
- Modern footer

### ProductListPage

- Product grid
- Desktop left filter sidebar
- Mobile filter drawer
- Sort dropdown
- Pagination
- Loading state
- Empty state
- Error state
- URL query params preserved across reloads

Filters:

- Pris
- Merke
- Kategori
- Størrelse
- Farge
- På lager
- Kampanje

Sorting:

- Nyheter
- Bestselgere
- Pris lav-høy
- Pris høy-lav

### CategoryPage

- Category-specific title
- Category description
- Reuse ProductList behavior
- Breadcrumb

### ProductDetailPage

- Large image gallery
- Thumbnails
- Product name
- Brand
- Rating placeholder
- Price and campaign price
- Variant, size, and color selection
- Stock indicator
- Delivery options
- Add to cart button
- Description
- Technical details
- Related products
- Disabled add button when out of stock
- Clear warning if variant is not selected

### CartPage And CartDrawer

- Cart must stay synchronized with backend
- Quantity increase/decrease
- Remove item
- Clear cart
- Summary with subtotal, MVA, shipping estimate, and total
- Empty cart state
- Checkout button
- Never trust frontend-calculated price; display backend totals
- CartDrawer opens from header and works well on mobile

### CheckoutPage

- Clear checkout flow
- Address form
- Delivery method:
  - Hent i butikk
  - Sendes hjem
- Payment provider choice:
  - Vipps
  - Stripe
  - Klarna
  - Mock payment
- Order summary
- Checkout start API call
- Payment redirect/mock flow
- Form validation
- Friendly errors

### Auth And Account

- LoginPage with email/password, validation, loading, error state, redirect
- RegisterPage with first name, last name, email, password, terms checkbox, privacy links
- AccountPage with user info, address info, order link, logout
- OrdersPage with status badges
- OrderDetailPage with products, address, payment status, shipping status, totals, MVA, date

Order statuses:

- PENDING
- PAYMENT_PROCESSING
- PAID
- FAILED
- CANCELLED
- REFUNDED
- SHIPPED
- DELIVERED

### Admin

- Admin routes must be available only for ADMIN role
- AdminDashboard cards:
  - Total orders
  - Total revenue
  - Low stock products
  - Pending orders
- AdminProducts with search, filter, create, edit, delete, stock info
- AdminProductForm with category, brand, price, campaign price, description, images, variants, inventory, validation
- AdminOrders with status filter, order detail, status update
- AdminCategories with list, create, edit, delete

### Legal

- PrivacyPolicyPage with GDPR-friendly layout
- TermsPage
- CookieBanner with Accept / Reject / Customize
- Cookie choice can be stored in localStorage

## State And Data

- Zustand for auth state and cart drawer UI state
- TanStack Query for server state
- Product, cart, order, auth API calls must be separated into query/mutation hooks
- API client must be centralized
- Access token should be added to Authorization header when needed
- 401 behavior must be handled cleanly
- Refresh token integration should match backend capabilities

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Products:

- `GET /api/products`
- `GET /api/products/:slug`

Categories:

- `GET /api/categories`
- `GET /api/categories/:slug`

Brands:

- `GET /api/brands`

Cart:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

Checkout:

- `POST /api/checkout/start`

Orders:

- `GET /api/orders`
- `GET /api/orders/:id`

Payment:

- `POST /api/payments/webhook`

Admin:

- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/brands`
- `PATCH /api/admin/brands/:id`
- `DELETE /api/admin/brands/:id`
- `POST /api/admin/orders/:id/refund`

## Preferred Frontend Structure

```txt
apps/frontend/src/
  app/
    router.tsx
    providers.tsx
  components/
    layout/
    ui/
    product/
    cart/
    checkout/
    admin/
    common/
  features/
    auth/
    products/
    categories/
    cart/
    checkout/
    orders/
    admin/
  hooks/
  lib/
    api.ts
    queryClient.ts
    formatters.ts
    constants.ts
    utils.ts
  pages/
  store/
  types/
  tests/
```

## TypeScript Rules

- Do not use `any`.
- Define API response types.
- Define Product, Category, Brand, Cart, CartItem, Order, User, and PaymentSession types.
- Handle null and undefined safely.
- Type component props.
- If backend fields are uncertain, add a type-safe adapter and a clear TODO.

## UX Rules

- User should reach products within 3 clicks.
- Add-to-cart must be obvious.
- Checkout must be simple.
- Error messages must be user-friendly, not technical.
- Loading, empty, and error states are mandatory.
- Mobile experience must be strong.
- Buttons must be large enough and easy to tap.
- Price and stock must be clear.
- Campaign products must visibly show the discount.

## Accessibility

- Semantic HTML
- Correct button/link usage
- Labels on form inputs
- Keyboard navigation
- Visible focus rings
- `aria-label` where needed
- Sufficient contrast
- Image alt text

## Performance

- Avoid unnecessary re-renders.
- Use TanStack Query cache.
- Lazy-load images.
- Split large components sensibly.
- Use skeleton loading.
- Production build must pass.

## Security

- Never trust frontend prices.
- Show checkout totals returned by backend.
- AdminRoute must require ADMIN role.
- Avoid `dangerouslySetInnerHTML`.
- Render user input safely.
- Do not show backend stack traces.
- Keep token handling pragmatic and aligned with backend.

## Testing Expectations

Prepare or add:

- ProductCard component test
- Login form validation test
- Cart drawer open/close test
- Add to cart flow test
- Checkout form validation test
- ProtectedRoute test
- AdminRoute test
- Playwright happy path:
  1. User lists products
  2. User opens product detail
  3. User adds item to cart
  4. User opens cart
  5. User starts checkout
  6. Mock payment succeeds
  7. Success page is visible

Commands expected eventually:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Implementation Priority

1. Routing and layout
2. API client and types
3. Auth flow
4. Product listing
5. Product detail
6. Cart
7. Checkout
8. Orders
9. Admin panel
10. Cookie/legal pages
11. Tests
12. Final polish

## Recommended Incremental Frontend Stages

For best results, frontend work should be split:

1. Build frontend foundation: routing, layout, providers, API client, types, Zustand stores, Header, Footer, HomePage, NotFoundPage. Leave deeper pages as route placeholders. Build and typecheck must pass.
2. ProductListPage, CategoryPage, ProductCard, filters, sort, pagination, loading/empty/error state, URL query sync.
3. ProductDetailPage, variant selection, stock indicator, gallery, add-to-cart.
4. CartPage and CartDrawer integrated with backend.
5. Checkout, payment success/failure, orders.
6. Auth and account polish.
7. Admin panel.
8. Cookie/legal pages and final accessibility/performance polish.
