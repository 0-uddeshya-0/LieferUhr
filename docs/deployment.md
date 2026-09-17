# Deployment

## Recommended infrastructure

- **Provider:** Hetzner Cloud (Germany) — EU data residency
- **Server:** CX22 or larger (2 vCPU, 4 GB RAM, 40 GB SSD) running Docker
- **Database:** co-located Postgres 16 (compose service) or managed PostgreSQL
- **SMTP:** Mailgun, Postmark, or Hetzner-compatible relay
- **TLS:** Caddy or Traefik in front of the `site` container (terminates HTTPS)

## Production stack (Docker)

One origin serves everything: Lieferuhr Einkauf at `/`, FrachtRadar at
`/fleet/`, the Betriebsamt tools at `/suite/`, the API at `/api` (proxied to
the `api` container). Same origin means no CORS surface and
`SameSite=strict` cookies just work.

```bash
cp .env.prod.example .env.prod   # fill in secrets + your domain
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

| Service | Image | Role |
|---|---|---|
| `db` | postgres:16-alpine | persistent `pg_data` volume |
| `api` | `apps/api/Dockerfile` | runs `prisma migrate deploy` on boot, then serves on :3001 |
| `site` | `docker/site.Dockerfile` | nginx: web at `/`, fleet at `/fleet/`, suite at `/suite/`, `/api` → api:3001 |

Ops endpoints (unauthenticated, for monitors):

- `GET /healthz` — process up
- `GET /readyz` — 200 when the DB answers, 503 otherwise

Point your TLS terminator at `site` (`HTTP_PORT`, default 8080) and you're live.

## Environment (production)

See `.env.prod.example` for the full template. The URL model changed with the
same-origin layout:

```env
API_URL="https://app.yourdomain.de/api"
WEB_URL="https://app.yourdomain.de"
FLEET_URL="https://app.yourdomain.de/fleet"
```

All product API routes are mounted under `/api` (`/api/auth/login`,
`/api/loads`, …). `healthz`/`readyz` stay unprefixed.

`FLEET_URL` feeds the driver/tracking links in outbound emails. `UPLOAD_DIR`
must be a persistent, backed-up directory: it holds POD photos and generated
invoice PDFs. For multi-instance setups move this to object storage — the file
serving endpoints are the only consumers.

Cookies use `Secure=true` in production and `SameSite=strict`. The same-origin
layout satisfies both; if you ever split the apps onto different registrable
domains you must relax `sameSite` and extend CORS.

## Manual deploy (no Docker)

```bash
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm build

cd apps/api && node dist/server.js   # or pm2 start … --name lieferuhr-api
```

Serve `apps/web/dist`, `apps/fleet/dist` and `apps/suite/dist` via your web
server; use `docker/nginx.conf` as the reference config (fleet nested at
`/fleet/`, suite at `/suite/`).

## Cron jobs

Reminder, digest and fleet-ping jobs run inside the API process via
`node-cron`. Run exactly one API instance, or extract jobs to a worker before
scaling horizontally.

## Checklist

- [ ] Strong `JWT_SECRET`, `DB_PASSWORD`
- [ ] TLS in front of `site` (HTTPS required for `Secure` cookies)
- [ ] `WEB_URL`/`FLEET_URL`/`API_URL` match the public domain
- [ ] SMTP verified with production relay
- [ ] `pg_data` + `uploads` volumes in the backup plan
- [ ] `GET /readyz` returns 200 after `up`
- [ ] MailHog not reachable in production
