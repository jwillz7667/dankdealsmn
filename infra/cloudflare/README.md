# Cloudflare setup — R2 media + DNS

DankDeals stores product images in **Cloudflare R2** (S3-compatible) and serves
them through `media.dankdealsmn.com`. The admin uploads flow has the browser PUT
directly to R2 using a presigned URL minted by the API (`apps/api/src/infrastructure/r2.ts`),
so the bucket needs a CORS policy that allows `PUT` from the storefront origin.

DNS for all three hostnames (apex → Vercel, `api` → Railway, `media` → R2) is
managed in the same Cloudflare zone.

Everything here is reproducible from the CLI with [`wrangler`](https://developers.cloudflare.com/workers/wrangler/).
Values that are environment-specific are written as `$VARS` — export them first.

## Prerequisites

```bash
pnpm dlx wrangler@latest --version     # or: npm i -g wrangler
wrangler login                          # opens a browser; authorizes your account
wrangler whoami                         # confirm the account + email
```

```bash
export CF_BUCKET="dankdeals-media"            # matches R2_BUCKET in the API config
export CF_ZONE="dankdealsmn.com"
export CF_MEDIA_HOST="media.dankdealsmn.com"
```

## 1. Create the R2 bucket

```bash
wrangler r2 bucket create "$CF_BUCKET"
wrangler r2 bucket list                  # verify
```

## 2. Apply the CORS policy

Required so the admin dashboard can upload straight to R2 (presigned PUT carries a
`Content-Type` header from `https://dankdealsmn.com`). Policy lives in `r2-cors.json`.

```bash
wrangler r2 bucket cors set "$CF_BUCKET" --file infra/cloudflare/r2-cors.json
wrangler r2 bucket cors list "$CF_BUCKET"
```

## 3. Bind the public custom domain

Public reads (`next/image`) are served from `media.dankdealsmn.com`, **not** the
`*.r2.cloudflarestorage.com` S3 endpoint (that one is credentialed/private and is
only used for the presigned PUT). Connect the custom domain to the bucket:

```bash
wrangler r2 bucket domain add "$CF_BUCKET" --domain "$CF_MEDIA_HOST"
wrangler r2 bucket domain list "$CF_BUCKET"
```

This auto-creates the proxied CNAME for `media` in the zone and provisions TLS.

## 4. Create the S3 API token for the API

The Fastify API talks to R2 with the S3 SDK, so it needs an **R2 API token**
(Account → R2 → Manage API Tokens → *Object Read & Write*, scoped to this bucket).
This is a dashboard action — wrangler does not mint S3 tokens. Capture:

| Value                  | Maps to env var          |
| ---------------------- | ------------------------ |
| Account ID             | `R2_ACCOUNT_ID`          |
| Access Key ID          | `R2_ACCESS_KEY_ID`       |
| Secret Access Key      | `R2_SECRET_ACCESS_KEY`   |
| `dankdeals-media`      | `R2_BUCKET`              |
| `https://media.dankdealsmn.com` | `R2_PUBLIC_BASE_URL` |

Set these on Railway (API) — see `infra/cloudflare/../../railway.json` and the deploy notes.

## 5. DNS records (Cloudflare zone `dankdealsmn.com`)

`media` is created in step 3. Add the apex (Vercel) and `api` (Railway) records.
Use the exact CNAME/A targets Vercel and Railway show in their dashboards.

| Host                      | Type  | Target                          | Proxy        | Serves        |
| ------------------------- | ----- | ------------------------------- | ------------ | ------------- |
| `dankdealsmn.com` (apex)  | A     | `76.76.21.21` (Vercel)          | DNS only¹    | Storefront    |
| `www`                     | CNAME | `cname.vercel-dns.com`          | DNS only¹    | → apex        |
| `api`                     | CNAME | `<service>.up.railway.app`      | Proxied      | Fastify API   |
| `media`                   | CNAME | (managed by R2 in step 3)       | Proxied      | R2 media      |

¹ Vercel manages its own edge/TLS; keep its records **DNS only** (grey cloud) unless
you have configured Cloudflare's proxy to coexist with Vercel. Railway and R2 records
are proxied (orange cloud).

Add a record from the CLI (example for `api`):

```bash
# Requires CLOUDFLARE_API_TOKEN with Zone:DNS:Edit; ZONE_ID from the dashboard.
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"api","content":"<service>.up.railway.app","proxied":true}'
```

## Verify

```bash
# Bucket + CORS
wrangler r2 bucket cors list "$CF_BUCKET"
# Public host resolves and serves an uploaded object
curl -I "https://$CF_MEDIA_HOST/products/<some-key>.webp"
```
