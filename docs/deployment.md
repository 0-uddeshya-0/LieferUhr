# Deployment

## Recommended infrastructure

- **Provider:** Hetzner Cloud (Germany) — EU data residency
- **Server:** CX21 or larger (2 vCPU, 4 GB RAM, 40 GB SSD)
- **Database:** Managed PostgreSQL or co-located Postgres 16
- **SMTP:** Mailgun, Postmark, or Hetzner-compatible relay

## Build

```bash
pnpm install
pnpm db:generate
pnpm --filter @lieferradar/shared build
pnpm --filter @lieferradar/api build
pnpm --filter @lieferradar/web build
pnpm --filter @lieferradar/fleet build
```

Artifacts:

- API: `apps/api/dist/`
- Web: `apps/web/dist/` (static files)
- Fleet: `apps/fleet/dist/` (static files + service worker + manifest)

## Environment (production)

Set `NODE_ENV=production` and use strong secrets:

```env
DATABASE_URL="postgresql://user:pass@db-host:5432/lieferradar"
JWT_SECRET="<64+ random characters>"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="..."
SMTP_PASS="..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.de"
API_URL="https://api.yourdomain.de"
WEB_URL="https://app.yourdomain.de"
FLEET_URL="https://fleet.yourdomain.de"
UPLOAD_DIR="/var/lib/lieferradar/uploads"
```

`FLEET_URL` is the public origin of the FrachtRadar app — it feeds CORS and
the driver/tracking links in outbound emails. `UPLOAD_DIR` must be a
persistent, backed-up directory: it holds POD photos and generated invoice
PDFs. For multi-instance setups move this to object storage — the file
serving endpoints are the only consumers.

Cookies use `Secure=true` automatically in production. Session cookies are
`SameSite=strict`, so keep each frontend and the API on the same registrable
domain (e.g. `fleet.example.de` → `api.example.de` is fine; a different
domain entirely is not).

## Process management

```bash
# API
cd apps/api && node dist/server.js

# Or with PM2
pm2 start apps/api/dist/server.js --name lieferradar-api
```

Serve the web `dist/` folder via nginx or Caddy.

## Nginx example

```nginx
server {
    listen 443 ssl;
    server_name app.yourdomain.de;

    root /var/www/lieferradar/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 443 ssl;
    server_name api.yourdomain.de;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl;
    server_name fleet.yourdomain.de;

    root /var/www/lieferradar/fleet/dist;
    index index.html;

    # PWA: never serve a stale service worker
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Database migrations

```bash
pnpm exec prisma migrate deploy
```

Run on deploy before starting the API.

## Cron jobs

Reminder and digest jobs run inside the API process via `node-cron`. Only one API instance should run cron in production, or extract jobs to a separate worker.

## Checklist

- [ ] Strong `JWT_SECRET` and database credentials
- [ ] HTTPS on all domains (web, fleet, API)
- [ ] `WEB_URL` and `FLEET_URL` match actual frontend origins (CORS)
- [ ] SMTP verified with production relay
- [ ] `prisma migrate deploy` applied
- [ ] `UPLOAD_DIR` on persistent storage, included in backups
- [ ] MailHog **not** used in production
- [ ] Backups configured for PostgreSQL
