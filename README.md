# DankDeals

Twin Cities cannabis delivery — production storefront, admin, and API.

| Surface          | Stack                                   | Host    | Domain                  |
| ---------------- | --------------------------------------- | ------- | ----------------------- |
| Storefront/Admin | Next.js 15 (App Router), Auth.js v5     | Vercel  | `dankdealsmn.com`       |
| API              | Fastify + Prisma                        | Railway | `api.dankdealsmn.com`   |
| Data             | PostgreSQL + Redis                      | Railway | —                       |
| Media            | Cloudflare R2 (presigned uploads + CDN) | —       | `media.dankdealsmn.com` |

Monorepo: **pnpm workspaces + Turborepo**. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, conventions, and the canonical business rules ported from the design prototype in [`design/`](./design).

## Quick start

```bash
# 1. Prerequisites: Node 20.11+, pnpm 9+, Docker
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install

# 2. Local infra + env
docker compose up -d
cp .env.example .env
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# 3. Database
pnpm db:migrate        # apply schema
pnpm db:seed           # load the 28-product catalog, categories, zones, promos

# 4. Run
pnpm dev               # web → http://localhost:3000   api → http://localhost:4000
```

## Workspaces

- [`apps/web`](./apps/web) — Next.js storefront + admin dashboard + SEO + auth.
- [`apps/api`](./apps/api) — Fastify domain API (catalog, cart, checkout, orders, admin, uploads).
- [`packages/db`](./packages/db) — Prisma schema, client, and seed (single source of truth).
- [`packages/config`](./packages/config) — shared tsconfig / eslint / prettier.

## Scripts

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm db:migrate` · `pnpm db:seed` · `pnpm db:studio`. See [`CLAUDE.md`](./CLAUDE.md#commands) for the full list.

## Compliance

21+ only. Age gate + checkout ID verification, cash/debit on delivery (no online card capture), Minnesota license `#MN-CAN-0421`. Do not remove the compliance footer or age gate.
