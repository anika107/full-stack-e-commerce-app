# ShopPilot

A full-stack e-commerce application with a modern storefront and a complete admin panel. Built with Next.js 16 (App Router, Server Components), TypeScript, Tailwind CSS, PostgreSQL (Neon), Prisma, and Auth.js.

## Features

**Storefront**
- Premium homepage — hero, category tiles, featured (best sellers), editorial band, new arrivals
- Product listing — search, category filter, sorting (newest / price), pagination, partial prerendering
- Product details — photo, description, live stock status, quantity selector, add to cart
- Shopping cart — cookie-persisted; prices and stock are always re-read from the database, never trusted from the client; out-of-stock lines are flagged and excluded from the subtotal
- Dark mode, responsive layouts, category-relevant product photography

**Admin panel** (protected by role-based auth)
- Dashboard — revenue/orders/products/stock KPIs with real deltas and sparklines, 12-month revenue chart, recent orders, out-of-stock list, top categories
- Orders — status filter, pagination
- Products — search, category filter, create / edit / delete (delete is blocked for products with order history)
- Categories — create and rename with duplicate-name validation
- Inventory — live stock levels, total/out-of-stock/in-stock summary

**Authentication**
- Credentials login (Auth.js v5, JWT sessions)
- Role-based `User` model (`ADMIN` / `CUSTOMER`)
- `src/proxy.ts` guards all `/admin/*` routes (Next 16 Proxy replaces middleware)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components, Partial Prerendering) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | next-auth (Auth.js v5) + bcryptjs |
| Fonts | Fraunces (display) · Inter (body) · Geist Mono |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment** — create `.env` (never committed):

   ```env
   DATABASE_URL="postgresql://…"   # Neon pooled connection string
   AUTH_SECRET="…"                 # openssl rand -base64 32
   AUTH_TRUST_HOST=true
   ```

3. **Push the schema and seed the database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

   The seed creates 6 categories, 30 products with real descriptions and photos, inventory levels, 24 demo customers, and ~12 months of orders so the admin dashboard shows real numbers. Re-running is safe (catalog and orders are reset; users are upserted).

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Storefront: [http://localhost:3000](http://localhost:3000) · Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Admin access

| | |
|---|---|
| **URL** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Email** | `admin@gmail.com` |
| **Password** | `admin123` |

Demo customers exist too (e.g. `customer01@example.com` / `customer123`), but only `ADMIN` users can enter the panel — customers are redirected back to the login page. Admin credentials can be changed at seed time via the `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` environment variables.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Reset catalog + orders and upsert users |

## Project structure

```
prisma/
  schema.prisma            # User/Role, Order/OrderItem, Category, Product, Inventory
  seed.ts                  # catalog, demo customers, 12 months of orders, admin user
  migrations/
src/
  auth.ts                  # Auth.js configuration (Credentials + JWT + role)
  proxy.ts                 # /admin route guard (Next 16 Proxy)
  db.ts                    # PrismaClient + PrismaPg adapter
  app/
    (store)/               # storefront: home, products, product detail, cart
    admin/                 # login + (panel): dashboard, orders, products, categories, inventory
    api/auth/[...nextauth] # Auth.js handlers
  components/
    storefront/            # product cards, cart UI, storefront-specific components
    admin/                 # admin tables, forms, charts
    ui/                    # shared primitives (NavSelect)
    skeletons/             # Suspense fallbacks
  lib/
    services/              # server-only data layer (auth gate + queries)
    cart.ts / cart-actions.ts  # cookie cart + server actions
```

## Architecture notes

- **Server Components by default** — pages are static shells with `<Suspense>`-streamed data (routes show as `◐` Partial Prerender in the build output); client components exist only for interactivity.
- **URL-driven state** — search, filters, sorting, pagination, and forms all navigate via query params, so every view is shareable and works without client-side fetching.
- **Server-authoritative cart** — the cookie stores only product IDs and quantities; totals, prices, and stock come from the database on every render.
- **Auth close to the data** — every admin service getter calls `verifySession()` before querying, and server actions repeat the check, so the proxy is a first filter, not the only line of defense.
