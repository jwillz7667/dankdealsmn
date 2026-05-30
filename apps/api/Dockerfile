# syntax=docker/dockerfile:1.7
# ============================================================
# DankDeals API — Fastify + Prisma (Railway)
# Build context MUST be the repo root (monorepo); Railway uses
# `dockerfilePath: apps/api/Dockerfile` with the root as context.
# ============================================================

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    COREPACK_HOME="/pnpm/corepack" \
    COREPACK_ENABLE_DOWNLOAD_PROMPT="0"
# OpenSSL + CA certs are required by Prisma's query engine at runtime.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# Pre-cache pnpm in a shared COREPACK_HOME so the non-root runtime user reuses it
# (no re-download during the Railway release/migrate step).
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate \
  && chmod -R a+rX /pnpm
WORKDIR /app

# ---- build: install the API subtree, generate the client, compile db + api ----
FROM base AS build
# Manifests first for a cache-friendly install layer. All four are copied so
# `--frozen-lockfile` can validate the whole workspace; only the API subtree
# (api + db + config) is actually installed via the filter.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter "@dankdeals/api..." --ignore-scripts

# Source for the packages the API needs (web source is intentionally excluded).
COPY packages/config packages/config
COPY packages/db packages/db
COPY apps/api apps/api
# `db build` runs `prisma generate` (emits the Debian engine, see schema
# binaryTargets) then compiles the package; `api build` is `tsc`.
RUN pnpm --filter @dankdeals/db build \
  && pnpm --filter @dankdeals/api build
# Reshape node_modules to production-only (deterministic, non-interactive — unlike
# `pnpm prune`). Build artifacts (dist/, generated/) live in the source tree and are
# untouched. `prisma` survives (runtime dep of @dankdeals/db → `migrate deploy`
# works in the release step); typescript/tsx/vitest are dropped.
RUN pnpm install --frozen-lockfile --filter "@dankdeals/api..." --prod --ignore-scripts

# ---- runtime: minimal image carrying only the built, pruned workspace ----
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Copy the entire /app so pnpm's symlinked node_modules layout stays intact.
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 4000
# Liveness probe; Railway injects $PORT and the server binds to it (config.PORT).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||process.env.API_PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/api/dist/server.js"]
