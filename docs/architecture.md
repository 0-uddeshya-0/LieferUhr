# Architecture

## Overview

Lieferuhr is a pnpm monorepo with seven packages:

| Package | Role | Stack |
|---------|------|-------|
| `@lieferradar/api` | REST API, cron jobs, email, webhooks | Fastify 4, Prisma, Nodemailer |
| `@lieferradar/web` | Manager dashboard & supplier status UI | React 18, Vite, TanStack Query |
| `@lieferradar/fleet` | FrachtRadar carrier PWA (dispatch, driver link, tracking) | React 18, Vite, TanStack Query, PWA |
| `@lieferradar/suite` | Betriebsamt tool family (FrachtAmt, PrüfAmt, EinsatzAmt, PostAmt) — currently a demo surface with in-memory stores | React 18, Vite |
| `@lieferradar/shared` | Validation schemas & labels | Zod, TypeScript |
| `@lieferradar/mcp` | MCP server for AI agents | @modelcontextprotocol/sdk |
| `@lieferradar/csv-watch` | Folder-watching ERP connector | Node 20, REST API client |

Two products + one tool family, one backend: `apps/web` serves purchasing
organizations, `apps/fleet` serves carriers, `apps/suite` hosts the four
standalone Betriebsamt tools (each an independent route group with its own
accent and demo store). The flagship apps authenticate against the same API
and `Organization` model; the suite's production spine (connectors, agent
approval queue, entitlements) is sequenced in
[production-plan.md](production-plan.md) phase 4.

## Request flow

### Manager workflow

1. Manager authenticates via JWT (httpOnly cookies)
2. Creates or imports orders scoped to their organization
3. API sends initial supplier notification email with magic link
4. Dashboard polls summary and order list endpoints
5. Manager can manually trigger reminders (`POST /orders/:id/remind`)

### Supplier workflow

1. Supplier opens magic link (`GET /s/:token`) — no auth
2. Submits status plus an optional confirmed delivery date via `POST /s/:token`
3. API records `OrderEvent`, updates order (including AB-Abgleich: a confirmed
   date later than the requested date marks the order critical), emails the
   manager, and fires the org's webhook (`order.supplier_responded`)

### Dispatcher workflow (FrachtRadar)

1. Dispatcher authenticates on the fleet app (`apps/fleet`, port 5174)
2. Creates customers/drivers/vehicles, then a load — or bulk-imports via CSV
3. Assigns driver + vehicle (`POST /loads/:id/assign`) — load becomes
   `DISPATCHED`, driver gets the `/t/:token` link by email, customer gets the
   `/l/:token` tracking link
4. Monitors the dispatch board and KPIs (`GET /fleet/overview`)
5. Issues a PDF invoice once the load is `DELIVERED`
   (`POST /loads/:id/invoice`)

### Driver workflow

1. Driver opens the `/t/:token` link — public, no account; installable PWA
2. Advances the load through its allowed transitions
   (`DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED`)
3. Uploads the signed delivery note as a photo/PDF (`POST /t/:token/pod`,
   max 5 MB, JPEG/PNG/HEIC/WebP/PDF only)
4. Each update records a `LoadEvent`, refreshes `lastDriverUpdate`, emails
   the dispatcher, and fires `load.driver_responded`

### Shipper tracking workflow

1. Customer opens `/l/:token` — read-only status, time windows, event
   timeline, POD download once delivered
2. The link is sent automatically on dispatch when the customer has a
   `contactEmail`; it can also be copied and shared manually

### Integration surface

- **API keys** (`Authorization: Bearer lr_...`) work on every protected route
- **Webhooks** per organization, HMAC-signed (`order.status_changed`,
  `order.supplier_responded`, `order.reminder_sent`, `load.status_changed`,
  `load.driver_responded`, `invoice.issued`)
- **MCP server** (`packages/mcp`) exposes orders/scorecards/reminders as tools
- **CSV-watch connector** (`packages/csv-watch`) polls a folder for ERP exports
  and imports them via the API — works with any ERP that can export CSV

### Background jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `reminderJob` | `REMINDER_CRON` (default hourly) | Auto-reminders after 2/5 days silence |
| `digestJob` | `DIGEST_CRON` (default Mon 08:00) | Weekly summary email per org, incl. expiring licenses/inspections and open loads |
| `fleetJob` | `FLEET_PING_CRON` (default hourly :15) | Pings drivers on dispatched loads whose pickup window started without confirmation (max 1 ping / 2 h / load) |

Jobs are disabled when `NODE_ENV=test`.

## Security model

- JWT access tokens (15 min) + DB-backed refresh tokens (rotated on use)
- Global rate limit 300 req/min per IP; stricter per-route: login (5/min),
  register (3/hour), supplier status (10/hour/token), driver link (60/hour/token
  reads, 20/hour writes/uploads), tracking link (60/hour, POD 30/hour)
- CORS restricted to `WEB_URL` + `FLEET_URL` in production
- All protected routes use `requireAuth` middleware; every fleet query is
  org-scoped and referenced entities (customer/driver/vehicle) are verified
  to belong to the caller's org before linking
- Capability tokens (`magicToken`, `driverToken`, `trackingToken`, invite
  `token`) are `nanoid(32)` — cryptographically random, ~192 bits of entropy
- POD/invoice files are stored under `UPLOAD_DIR/<orgId>/…` with randomized
  sanitized filenames and served with `X-Content-Type-Options: nosniff`
- Manual driver ping throttled to once per 30 minutes per load

## Key modules

```
apps/api/src/
├── routes/          # HTTP endpoints
├── services/        # Business logic (orders, suppliers, email, reminders)
├── jobs/            # Cron schedulers
├── utils/           # delayRisk, scorecard computation
└── plugins/         # auth, cors, rateLimit
```

## Frontend routing

| Route | Auth | Page |
|-------|------|------|
| `/login` | Public | Login / register |
| `/dashboard` | Protected | Order overview |
| `/orders/:id` | Protected | Order detail + timeline |
| `/orders/new` | Protected | Manual order form |
| `/suppliers` | Protected | Supplier scorecard |
| `/import` | Protected | CSV upload |
| `/team` | Protected | Members & invites |
| `/s/:token` | Public | Supplier status page |
| `/invite/:token` | Public | Accept team invitation |

### Fleet app (`apps/fleet`)

| Route | Auth | Page |
|-------|------|------|
| `/` | Public | Landing page |
| `/login` | Public | Login / register |
| `/dispatch` | Protected | Dispatch board + KPIs |
| `/loads/new`, `/loads/:id` | Protected | Load form / detail |
| `/fleet` | Protected | Drivers & vehicles registry |
| `/customers` | Protected | Shipper customers |
| `/import` | Protected | CSV import (customers, loads) |
| `/invoices` | Protected | Invoice list + paid marking |
| `/t/:token` | Public | Driver tour page (PWA) |
| `/l/:token` | Public | Shipper tracking page |
