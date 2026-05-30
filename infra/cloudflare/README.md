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

> A pre-existing wrangler session may have been authorized **without R2 scopes**
> (`r2:write`). If `wrangler r2 bucket list` returns an authorization error, run
> `wrangler logout && wrangler login` to re-grant — the current login flow requests
> R2 permissions. DNS records (step 5) need a token with **Zone:DNS:Edit**, which the
> OAuth login does not grant; create that separately under *My Profile → API Tokens*.

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

These are the **live targets** as provisioned (Vercel project `dankdealsmn`,
Railway service `dankdealsmn`). `media` is created in step 3. Add the records
below in the Cloudflare zone. Re-confirm against the Vercel/Railway dashboards
if a platform rotates an anycast IP or CNAME target.

### 5a. Vercel domain ownership (TXT) — required first

Because DNS lives in Cloudflare (not on Vercel nameservers), Vercel verifies
ownership via a TXT record. Add **one** `_vercel` TXT host with both values
(Cloudflare allows multiple TXT values on the same name):

| Host       | Type | Value                                                  |
| ---------- | ---- | ------------------------------------------------------ |
| `_vercel`  | TXT  | `vc-domain-verify=dankdealsmn.com,5cb5f418badf80d32b30`     |
| `_vercel`  | TXT  | `vc-domain-verify=www.dankdealsmn.com,0509c94cc8080544fd48` |

### 5b. Traffic records

| Host                      | Type  | Target                          | Proxy        | Serves        |
| ------------------------- | ----- | ------------------------------- | ------------ | ------------- |
| `dankdealsmn.com` (apex)  | A     | `64.29.17.65`                   | DNS only¹    | Storefront    |
| `dankdealsmn.com` (apex)  | A     | `216.198.79.65`                 | DNS only¹    | Storefront    |
| `www`                     | CNAME | `cname.vercel-dns.com`          | DNS only¹    | → apex        |
| `api`                     | CNAME | `50blr5m7.up.railway.app`       | DNS only²    | Fastify API   |
| `media`                   | CNAME | (managed by R2 in step 3)       | Proxied      | R2 media      |

¹ Vercel manages its own edge/TLS; keep its records **DNS only** (grey cloud).
  Cloudflare flattens an apex `CNAME`, so you may instead set the apex to a
  `CNAME → cname.vercel-dns.com` (DNS only) rather than the two A records.
² Railway provisions the TLS cert for `api.dankdealsmn.com` via this CNAME — keep
  it **DNS only** (grey cloud) until the cert is issued. You may switch it to
  Proxied (orange) afterward with SSL mode **Full (strict)** if you want Cloudflare
  in front of the API.

Add a record from the CLI (example for `api`):

```bash
# Requires CLOUDFLARE_API_TOKEN with Zone:DNS:Edit; ZONE_ID from the dashboard.
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"api","content":"50blr5m7.up.railway.app","proxied":false}'
```

## Verify

```bash
# Bucket + CORS
wrangler r2 bucket cors list "$CF_BUCKET"
# Public host resolves and serves an uploaded object
curl -I "https://$CF_MEDIA_HOST/products/<some-key>.webp"
```
