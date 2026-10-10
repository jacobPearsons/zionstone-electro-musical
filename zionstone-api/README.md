# Zionstone API

Standalone Express + TypeScript backend for the Zionstone store. It owns the
product-submission queue, Paystack checkout initialization/verification, and
shipping quotes. It is consumed cross-origin by the `zionstone-store` Next.js
storefront.

- **Runtime:** Node.js (compiled to `dist/`) with Bun as the package manager.
- **Database:** PostgreSQL via Prisma.
- **Deploy target:** Render (native runtime) + Neon Postgres.

## Endpoints

| Method | Path                     | Auth      | Purpose                                    |
| ------ | ------------------------ | --------- | ------------------------------------------ |
| GET    | `/api/health`            | none      | Liveness. Never touches the DB.            |
| GET    | `/api/ready`             | none      | Readiness. Pings the DB; 503 when down.    |
| GET    | `/uploads/:file`         | none      | Serves uploaded product photos.            |
| GET    | `/api/queue`             | Clerk     | List queue items (optional `?status=`).    |
| PATCH  | `/api/queue/:id`         | Clerk     | Update a queue item's status.              |
| POST   | `/api/paystack/initialize` | none    | Start a Paystack transaction.              |
| POST   | `/api/paystack/verify`   | none      | Verify a Paystack reference.               |
| POST   | `/api/shipping/quote`    | none      | Shipping quote for a cart/destination.     |

Responses use a `{ ok: true, ... }` / `{ ok: false, error }` envelope.

## Local development

Requires Bun and a local Postgres.

```bash
bun install
cp .env.example .env          # then edit DATABASE_URL etc.
bunx prisma migrate dev       # create/apply migrations
bun run dev                   # tsx watch on http://localhost:4000
```

Quality gates:

```bash
bun run test                  # jest
bunx tsc --noEmit             # typecheck
bun run build                 # emit dist/
```

## Environment variables

See `.env.example` for the full annotated list. Summary:

| Variable              | Required            | Notes                                                             |
| --------------------- | ------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`        | yes                 | App runtime connection (Neon **pooled** URL).                     |
| `DIRECT_URL`          | recommended         | Neon **direct** URL; used only for `prisma migrate deploy`.       |
| `DATABASE_URL_POOLED` | no                  | Fallback for `DATABASE_URL` when the latter is unset.             |
| `NODE_ENV`            | no                  | `production` on Render (enables fail-closed CORS).                |
| `PORT`                | no                  | Render injects it.                                                |
| `PUBLIC_API_URL`      | prod                | Base for `${PUBLIC_API_URL}/uploads/<file>` image URLs.           |
| `PUBLIC_SITE_URL`     | no                  | Storefront base URL (informational).                              |
| `CLIENT_ORIGIN`       | yes in prod         | Comma-separated allow-list; blank in prod denies browser origins. |
| `CLERK_SECRET_KEY`    | for queue routes    | Absent ⇒ `/api/queue` returns 503.                                |
| `PAYSTACK_SECRET_KEY` | for checkout routes | Absent ⇒ `/api/paystack/*` returns 503.                          |
| `UPLOAD_DIR`          | no                  | Upload directory; on Render set to the disk mount.                |
| `LOG_LEVEL`           | no                  | `debug`\|`info`\|`warn`\|`error` (default `info`).                 |

The server validates required config at startup and exits non-zero on missing
`DATABASE_URL`; missing optional config produces a warning, not a crash.

## Deploying to Render

The repo root contains `render.yaml` (a Blueprint) with `rootDir: zionstone-api`
and `runtime: node` — Render's native runtime ships Bun, so the build/start
commands run with `bun`. Bun is auto-enabled because `zionstone-api/bun.lock` is
present.

1. In Render, create a new **Blueprint** from this repo. It provisions the
   `zionstone-api` web service.
2. Wait for Neon to be ready (below), then fill the `sync: false` secrets in the
   Render dashboard: `DATABASE_URL`, `DIRECT_URL`, `PUBLIC_API_URL`,
   `PUBLIC_SITE_URL`, `CLIENT_ORIGIN`, `CLERK_SECRET_KEY`, `PAYSTACK_SECRET_KEY`.
3. Deploy. On each boot, `prisma migrate deploy` applies pending migrations
   (over `DIRECT_URL`), then the compiled server starts.

The service uses the **starter** plan because a persistent disk (for uploads) is
not available on the free instance type.

### Neon connection strings

Neon exposes two URLs for the same database:

- **Pooled** — host contains `-pooler`. Set as `DATABASE_URL` (app runtime).
- **Direct** — host without `-pooler`. Set as `DIRECT_URL` (migrations).

If the pooled connection errors with `channel_binding` or prepared-statement
messages, append `?pgbouncer=true&connection_limit=1` to the pooled URL. If you
only have one URL, set `DATABASE_URL` to it and leave `DIRECT_URL` blank.

### Uploads

Uploaded photos are written to `UPLOAD_DIR`, which the Blueprint points at the
persistent disk mounted at `/var/data` (`/var/data/uploads`). Without this, files
would be written to the container's ephemeral filesystem and lost on redeploy.
Set `PUBLIC_API_URL` to the service's public URL so returned image URLs are
absolute.

### Connecting the Netlify storefront

Set the storefront's server-side API base to this service's URL, and set this
service's `CLIENT_ORIGIN` to the storefront's origin(s), e.g.
`https://zionstone.netlify.app,https://www.zionstone.com`. In production, any
browser origin not on that list is denied — a missing `CLIENT_ORIGIN` fails
closed rather than allowing every origin.

## Why no Dockerfile

Render's native runtime already provides Bun, Node and `postgresql-client`, and
supports persistent disks, health checks and zero-downtime deploys. A Dockerfile
would add build/maintenance overhead without unlocking anything this service
needs, so the native Blueprint is the simpler and more maintainable choice.
