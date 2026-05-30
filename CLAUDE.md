# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**DankDeals** — a production cannabis-delivery storefront for the Twin Cities (Minneapolis/St. Paul metro), built from a Claude Design handoff prototype.

- **Storefront + admin:** Next.js 15 (App Router) on **Vercel** → `dankdealsmn.com`
- **API:** Fastify + Prisma on **Railway** → `api.dankdealsmn.com`
- **Data:** PostgreSQL + Redis on Railway
- **Auth:** Auth.js v5 (NextAuth) — Google OAuth + passwordless magic link (Resend)
- **Media:** Cloudflare R2 (S3-compatible) via presigned uploads, served through `next/image`

The original design prototype lives in **`design/`** and is the **source of truth for visual design, copy, and business logic**. It is a plain-HTML/CSS/JS bundle (no build step) produced by a design tool — do not deploy it, but mine it for the design system (`design/project/css/styles.css`), catalog data (`design/project/js/data.js`), and the canonical pricing/checkout logic (`design/project/js/store.js`, `checkout.js`). See **§ Porting from the prototype**.

## Monorepo layout

```
.
├── apps/
│   ├── web/                 # Next.js 15 — storefront, admin, SEO, Auth.js     (Vercel)
│   └── api/                 # Fastify + Prisma — domain API, RBAC, R2 uploads  (Railway)
├── packages/
│   ├── db/                  # Prisma schema + generated client + seed (shared by web & api)
│   └── config/              # shared tsconfig, eslint, prettier, shared types/contracts
├── design/                  # ORIGINAL design prototype — reference only, never deployed
├── turbo.json               # Turborepo pipeline
├── pnpm-workspace.yaml
└── package.json             # workspace root
```

**Package manager is pnpm; orchestration is Turborepo.** Always run scripts from the repo root via `pnpm` (it resolves workspaces) or with `--filter`.

## Commands

All from repo root unless noted.

```bash
pnpm install                         # install all workspaces

# Dev (parallel via Turbo)
pnpm dev                             # web (:3000) + api (:4000) together
pnpm --filter @dankdeals/web dev     # storefront only
pnpm --filter @dankdeals/api dev     # API only

# Database (packages/db)
pnpm db:generate                     # prisma generate
pnpm db:migrate                      # prisma migrate dev   (creates + applies a migration)
pnpm db:migrate:deploy               # prisma migrate deploy (CI/prod — no prompts)
pnpm db:seed                         # seed from design/js/data.js catalog
pnpm db:studio                       # Prisma Studio
pnpm db:reset                        # DROP + remigrate + reseed (local only)

# Quality gates
pnpm lint                            # eslint across workspaces
pnpm typecheck                       # tsc --noEmit across workspaces
pnpm test                            # all tests (vitest)
pnpm --filter @dankdeals/api test    # one workspace
pnpm --filter @dankdeals/api test -- src/features/orders/orders.service.test.ts   # one file
pnpm --filter @dankdeals/api test -- -t "free delivery over 75"                   # one test by name
pnpm build                           # build all (Turbo-cached)
```

Local infra (Postgres + Redis) via `docker compose up -d` (see `docker-compose.yml`). Copy `.env.example` → `.env` in each app before running.

## Architecture & data flow

**Strict dependency direction (enforced, see global rules):** UI → application → domain → infrastructure. The `domain/` layer in each app holds pure types + invariants and imports no framework/transport/persistence code.

- **`packages/db` is the single owner of the schema.** Both apps import the generated Prisma client from here. There is **one** `schema.prisma`. The API is the primary writer of domain tables (products, orders, …); Auth.js (in `web`) owns the auth tables (`User`, `Account`, `Session`, `VerificationToken`) via the Prisma adapter against the same database.
- **Storefront reads happen server-side.** Catalog/PDP/category pages are React Server Components that fetch from the Fastify API with `fetch` + Next caching (ISR via `revalidate`/tags). This keeps content crawlable (critical for SEO and the age gate — see below) and fast.
- **Mutations go to the API.** Cart, checkout, reviews, and all admin writes call Fastify. The API is the only place business rules live.
- **Auth bridge:** Auth.js issues the user session (cookie, scoped to `.dankdealsmn.com`). For server→API calls that act as the user, `web` mints a short-lived JWT carrying `sub` (userId) + `role`, signed with `AUTH_API_JWT_SECRET` (shared with the API). Fastify verifies it and enforces RBAC. Public catalog reads need no token.
- **Money is integer cents everywhere.** Never floats. Tax/discount rates are basis points (`Int`). Format only at the view edge.

### Canonical business rules — port EXACTLY (do not re-derive)

From `design/project/js/store.js` `totals()` and `data.js` `DD_DELIVERY`. These now live in `apps/api` domain + are the contract for `StoreSettings`/`PromoCode`:

- Delivery fee: **$5**, **free when subtotal ≥ $75**. Minimum order **$30**. Tax **10%**.
- Promo `DANK15` → 15% off subtotal. Promo `FREEDROP` → free delivery. (Promo codes are now DB-driven via `PromoCode`; seed these two.)
- Order total = `max(0, subtotal − discount) + fee + tax + tip`, where `tax = (subtotal − discount) × taxRate`. Tip default 15%.
- Order number format: `DD` + 6 digits.
- Delivery zones: the 14 metro cities in `DD_DELIVERY.zones` (seed into `DeliveryZone`).
- Order tracking stages: Confirmed → Preparing → Out for delivery → Delivered (model as `OrderEvent` rows; the confirmation page renders the timeline).

### Strain & badge taxonomy (from the prototype)

- Strain types: `Indica` / `Sativa` / `Hybrid` / `CBD` with brand dot colors `#6f4bd8 / #e0820f / var(--green) / #1f8fb0`.
- Badges: `deal` (ink), `new` (green), `best` (gold). `deal` correlates with a `compareAtPrice` (the prototype's `old`).
- Products carry `effects[]` (free tags), `thc`/`cbd` percentages, `size` label, `rating`/`reviews` (now backed by a real `Review` table with a denormalized `ratingAvg`/`ratingCount`).

## SEO (this is a first-class requirement)

Implemented in `apps/web` — treat as non-negotiable:

- **Metadata API** per route: title templates (`%s · DankDeals`), descriptions, `metadataBase = https://dankdealsmn.com`, canonical URLs, OpenGraph + Twitter cards. Dynamic OG images via `opengraph-image.tsx`.
- **JSON-LD structured data:** `Organization` + `LocalBusiness` (areaServed = the metro zones) site-wide; `Product` + `Offer` + `AggregateRating` on each PDP; `BreadcrumbList` on shop/PDP; `ItemList` on category pages; `FAQPage` where applicable.
- **`app/sitemap.ts`** (dynamic — all active products + categories), **`app/robots.ts`**, **`app/manifest.ts`**.
- **Crawlability:** the 21+ age gate is a **client-side overlay only** — the underlying page is fully server-rendered so bots and link previews see real content. Never gate content behind the modal at the data layer.
- Semantic, accessible HTML; `next/image` with width/height; `preconnect` to fonts; stable slugs (`Product.slug`, `Category.slug`) with `metaTitle`/`metaDescription` editable in admin.

## Security posture

- **Don't hand-roll auth** — Auth.js owns OAuth/session/CSRF. Magic-link only (no password storage).
- **Validate every external input with Zod** at the boundary (API bodies/query/params/headers, env at boot, webhooks, admin forms). Fail fast.
- **AuthZ deny-by-default.** `/admin/**` requires `role = ADMIN` (Next middleware + API guard). Tenant/role isolation enforced in the query layer, not the handler.
- **Secrets via env only**, never committed; validated at boot in both apps (`config` module with a Zod schema). See `.env.example`.
- **Injection-safe:** Prisma parameterized queries only; never string-concatenate SQL. Escape on output.
- **Headers:** Fastify `@fastify/helmet` + rate-limit + strict CORS (allow only the web origin). Next sets CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` in `next.config` headers.
- **Uploads:** admin requests a presigned R2 PUT from the API (ADMIN only); browser uploads directly; only image content-types + size caps; the API stores the resulting CDN URL. Never proxy raw uploads through the app server.
- **Compliance is a security control here:** 21+ age gate + checkout ID-21 confirmation are required; cash/debit only (no online card capture — there is no PCI card flow by design); license `#MN-CAN-0421` + FDA disclaimer must remain in the footer.

## Conventions (project-specific; see global CLAUDE.md for the rest)

- **Feature-first** folders. Each `features/<domain>/` co-locates routes/handlers, service, repo, schema (Zod), and tests. `domain/` is pure. `shared/` is cross-cutting. `infrastructure/` holds the Prisma client, Redis, R2, mail clients.
- **One Prisma schema** in `packages/db`; both apps consume `@dankdeals/db`. Run `pnpm db:generate` after editing it.
- **Shared API contracts** (Zod schemas + inferred types) live in `packages/config` (or `packages/db` for entity types) so `web` and `api` never drift. The web API client is typed against these.
- **Files:** TS `kebab-case.ts`; React components `PascalCase.tsx`; tests as siblings `*.test.ts`; integration under `apps/api/test/`.
- **Strict TS, no `any`, no stray `as`.** `const` over `let`. Async/await only.
- **Money:** store/compute in cents (`Int`); a single `formatMoney` helper at the view edge.

## Porting from the prototype (`design/`)

Mine these, then leave the prototype untouched:

- **Design tokens & components:** `design/project/css/styles.css` — port the `:root` token set verbatim into the web app's global CSS / Tailwind theme. Reuse class semantics (`.btn`, `.pcard`, `.chip`, `.badge`, `.qty`, `.rail`, `.pgrid`, drawer/sheet/age-gate patterns). Breakpoints 600 / 860 / 1080px.
- **Pages to rebuild pixel-perfectly:** home (`index.html`/`home.js`), shop (`shop.html`/`shop.js` — filters, sort, applied chips, mobile filter sheet), product (`product.html`/`product.js` — gallery, specs, related, sticky buy bar), cart (`cart.html`/`cart.js`), checkout (`checkout.html`/`checkout.js` — 4-step wizard Delivery→Time→Payment→Review), confirmation (`confirmation.html`/`confirmation.js` — live tracking timeline).
- **Chrome:** `design/project/js/chrome.js` injects header, delivery strip, mobile menu, cart drawer, search, footer, and 21+ age gate — rebuild as React layout/components.
- **Catalog seed:** `design/project/js/data.js` → `pnpm db:seed` (28 products, 8 categories, brands derived, delivery config, the two promo codes, 14 zones).
- **DO NOT carry into production:** `image-slot.js` (design-host web component — replace with `next/image` + R2), `theme.js` (the live theming/tweaks toolbar), `tweaks-panel.jsx` (stray, unloaded). The `window.DD*` globals, `localStorage`/`sessionStorage` state, and `data-page` attribute are prototype mechanics — replace with React state + the API.

## Admin dashboard

Under `apps/web/app/admin` (ADMIN-gated). Capabilities: product CRUD (all fields incl. SEO, strain, THC/CBD, price/compareAt, badges, effects, status, inventory) with **R2 image upload** (drag-drop, reorder, set primary); category & brand management; order management (view + status transitions that drive the tracking timeline, assign driver); promo-code management; delivery-zone + store-settings editor; review moderation. All forms Zod-validated; all mutations audited (`AuditLog`).

## Deploy

- **Vercel** deploys `apps/web` (root directory = `apps/web`, monorepo install). Domain `dankdealsmn.com` + `www` → apex redirect. Env: `NEXT_PUBLIC_API_URL`, `AUTH_*`, `NEXTAUTH_URL`, Google + Resend keys, `AUTH_API_JWT_SECRET`, R2 public base.
- **Railway** deploys `apps/api` (Dockerfile), plus Postgres + Redis plugins. Runs `prisma migrate deploy` on release. Env: `DATABASE_URL`, `REDIS_URL`, `AUTH_API_JWT_SECRET`, R2 credentials, `WEB_ORIGIN`, `RESEND_API_KEY`.
- CI (GitHub Actions): install → lint → typecheck → test → `prisma migrate deploy` (on main).
