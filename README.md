# Lieferuhr

[![CI](https://github.com/0-uddeshya-0/LieferUhr/actions/workflows/ci.yml/badge.svg)](https://github.com/0-uddeshya-0/LieferUhr/actions/workflows/ci.yml)

**Wissen, wann Ware ankommt.** — *Know when goods arrive.*

Lieferuhr is the umbrella for two lean tools built around the delivery date, sharing one API, auth, and tenancy:

- **Lieferuhr Einkauf** (`apps/web`) — supplier delay intelligence for purchasing teams in German manufacturing SMEs. Register open orders, send magic-link status pages to suppliers (no login), automate follow-up reminders, and monitor delay risk on a live dashboard with supplier reliability scorecards.
- **FrachtRadar** (`apps/fleet`) — freight management for regional carriers too small for classic TMS vendors (3–30 trucks). Dispatch loads, connect drivers via magic-link PWA (no app install, no account), collect photo PODs, give shippers a live tracking link, and issue PDF invoices.

See [docs/fleet-expansion.md](docs/fleet-expansion.md) and [docs/rollout-plan.md](docs/rollout-plan.md).

**Live demo (both products):** https://0-uddeshya-0.github.io/LieferUhr/ — the umbrella page links into each product's interactive demo; FrachtRadar ships nested under [`/LieferUhr/fleet/`](https://0-uddeshya-0.github.io/LieferUhr/fleet/).

## What works on GitHub Pages vs full deploy

| Feature | GitHub Pages (demo) | Full deploy (local / server) |
|---------|---------------------|------------------------------|
| Landing page & product overview | Yes | Yes |
| German / English language toggle | Yes | Yes |
| Dashboard with orders & filters | Sample data (in-memory) | Live data |
| Supplier scorecard | Sample data (in-memory) | Live data |
| Supplier magic-link page | Demo token (`/s/demo`) | Real magic links |
| CSV import, create orders & suppliers | Works for the session (in-memory) | Persisted in PostgreSQL |
| FrachtRadar dispatch board, drivers, loads | Sample data (in-memory) under `/fleet/` | Live data |
| Driver status link `/t/:token` + tracking `/l/:token` | Demo tokens (`/fleet/#/t/demo`, `#/l/demo`) | Real capability links |
| Login / registration | Skipped in demo | JWT with refresh tokens |
| Email notifications | — | SMTP (Mailgun, Postmark, etc.) |
| Cron reminders & weekly digest | — | node-cron jobs |
| API backend | — | Fastify on Node 20 |

GitHub Pages serves the static frontend only. For the full product (database, emails, cron jobs), run locally or deploy the API + PostgreSQL to a server — see [docs/deployment.md](docs/deployment.md).

## Features

- **Order management** — Create orders manually or import up to 500 rows via CSV (with order values)
- **Supplier magic links** — Mobile-friendly status page (`/s/:token`); suppliers confirm status and delivery dates without a login
- **AB-Abgleich** — Confirmed delivery dates are diffed against requested dates; late confirmations flag the order critical
- **Automated chasing** — Hourly cron sends reminders after 2 and 5 days of silence
- **Dashboard** — Filterable order table with risk indicators, value at risk in €, and 6-month trend charts
- **Supplier scorecard** — On-time rate, response time, and responsiveness labels per supplier
- **Team accounts** — Invite colleagues into the organization via email
- **ROI metrics** — Dashboard shows automated supplier requests in the last 30 days
- **Weekly digest** — Monday 08:00 email summary to managers
- **Bilingual UI** — German/English toggle, persisted per browser
- **JWT auth** — HttpOnly cookie sessions with refresh token rotation
- **API keys & webhooks** — Bearer-token API access plus HMAC-signed webhooks for n8n, Make, Zapier, or custom automation ([docs](docs/integrations.md))
- **MCP server** — AI agents (e.g. Claude) can query orders, scorecards, and send reminders via `packages/mcp`
- **DSGVO-ready** — Organization deletion endpoint and AVV template included

### FrachtRadar (fleet product)

- **Loads/Touren** — create or CSV-import loads; status machine `NEW → DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED → INVOICED` with full event timeline
- **Driver magic link** (`/t/:token`) — installable PWA with big status buttons and photo POD upload; no account, no app store
- **Shipper tracking link** (`/l/:token`) — read-only live status page, POD download after delivery; emailed to the customer on dispatch
- **Dispatch board** — status filters, assignment inline, KPIs (today's loads, unassigned, in transit, weekly revenue)
- **Fleet registry** — drivers (license expiry), vehicles (HU/TÜV date), shipper customers; CSV import
- **PDF invoicing** — sequential per-org invoice numbers (`RE-0001…`), 19 % USt, Zahlungsziel, ISSUED/PAID tracking
- **Automation** — hourly driver pings on late pickups, doc-expiry alerts in the weekly digest, signed webhooks (`load.status_changed`, `load.driver_responded`, `invoice.issued`)

## Roadmap

Sequenced by what pilot customers need next — see [docs/strategy.md](docs/strategy.md) for the reasoning.

1. Inbound email parsing — supplier replies update order status automatically
2. Native ERP connectors (SAP Business One Service Layer, proAlpha, abas) — the CSV-watch agent covers every ERP today
3. Per-customer sending domains for deliverability
4. Opt-in, anonymized supplier reliability benchmarks across organizations

## Architecture

```
┌─────────────────┐ ┌─────────────────┐     ┌──────────────────┐
│ Lieferuhr Einkauf │ │ FrachtRadar PWA │────▶│  Fastify API     │────▶ PostgreSQL
│   (:5173)       │ │   (:5174)       │     │  (Node, :3001)   │      (Prisma)
└─────────────────┘ └─────────────────┘     └────────┬─────────┘
                                                    │
                                       ┌────────────┼─────────────┐
                                       ▼            ▼             ▼
                                 ┌─────────┐  ┌─────────┐  ┌──────────────┐
                                 │  SMTP   │  │  Cron   │  │ Magic links  │
                                 │ (email) │  │  jobs   │  │ /s /t /l     │
                                 └─────────┘  └─────────┘  └──────────────┘
```

Monorepo layout (pnpm workspaces):

```
lieferuhr/
├── apps/api/          # Fastify backend
├── apps/web/          # Lieferuhr Einkauf frontend (purchasing)
├── apps/fleet/        # FrachtRadar PWA (carriers)
├── packages/shared/   # Zod schemas & shared types
├── packages/mcp/      # MCP server for AI agents
├── packages/csv-watch/# Folder-watching ERP connector
├── prisma/            # Schema, migrations, seed
├── scripts/           # Test data generator
└── docs/              # Architecture, API, deployment
```

See [docs/architecture.md](docs/architecture.md) for details.

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- **Docker** — for local PostgreSQL and MailHog

## Setup

```bash
git clone https://github.com/0-uddeshya-0/LieferUhr.git
cd LieferUhr
pnpm install

cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/fleet/.env.example apps/fleet/.env

docker compose up -d

pnpm db:generate
pnpm db:migrate
pnpm db:seed

pnpm dev:all      # API + both frontends (dev / dev:fleet for a subset)
```

- **Lieferuhr web:** http://localhost:5173
- **FrachtRadar app:** http://localhost:5174
- **API:** http://localhost:3001
- **MailHog UI:** http://localhost:8025

### Seed credentials

| Product | Email | Password |
|---------|-------|----------|
| Lieferuhr Einkauf (purchasing) | `manager@muster.de` | `Test1234!` |
| FrachtRadar (carrier) | `disponent@frachtradar.de` | `Test1234!` |

## Usage

1. **Register** or log in with seed credentials
2. **Import orders** via CSV (`Dashboard → Importieren`) or create manually
3. Suppliers receive an email with a magic link to update status
4. Monitor **delay risk** and use **Status anfragen** to manually ping suppliers
5. Review **Lieferanten** page for scorecard metrics (worst suppliers first)

### CSV import format

```csv
orderNumber,supplierEmail,partDescription,dueDate,quantity,unit,value
PO-2026-001,lieferant@mueller.de,Hydraulikzylinder 50mm,2026-09-15,10,Stück,18500.00
```

`value` is the order value in EUR and feeds the dashboard's "value at risk" metric.

## Configuration

All required environment variables are in `.env.example`. The API validates env on startup and fails fast if any are missing.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min. 32 characters |
| `SMTP_*` | SMTP relay settings |
| `API_URL` / `WEB_URL` / `FLEET_URL` | Public URLs for links and CORS |
| `UPLOAD_DIR` | Storage for POD photos and invoice PDFs (default `./uploads`) |
| `REMINDER_CRON` | Auto-reminder schedule (default: hourly) |
| `DIGEST_CRON` | Weekly digest schedule (default: Mon 08:00) |
| `FLEET_PING_CRON` | Driver ping sweep schedule (default: hourly at :15) |

Frontend: set `VITE_API_URL` in `apps/web/.env` and `apps/fleet/.env` (default `http://localhost:3001`).

## Running tests

```bash
# Requires Docker PostgreSQL running
docker compose up -d

pnpm test
```

Unit tests cover delay risk, scorecard, email templates, and Zod schemas. Integration tests cover the auth flow. Frontend tests cover `OrderTable` and `SupplierStatusPage`.

CI runs automatically on push and pull requests to `main`.

## Email testing (development)

MailHog captures all outbound email when using the default `.env.example` SMTP settings (`localhost:1025`). Open http://localhost:8025 to preview supplier notifications, reminders, and weekly digests.

## Deployment

Target hosting: **Hetzner Cloud (Germany)** for DSGVO-compliant data residency.

Suggested server: CX21 (2 vCPU, 4 GB RAM, 40 GB SSD).

See [docs/deployment.md](docs/deployment.md) for nginx, environment, and production checklist.

## Data compliance

- Default deployment region: Germany (Hetzner)
- AVV template: [docs/avv-template.md](docs/avv-template.md)
- Organization deletion: `DELETE /organizations/:id` (authenticated, own org only)
- No employee behavioral tracking; supplier emails used only for transactional notifications

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API won't start — env error | Copy `.env.example` → `.env`, fill all variables |
| Database connection refused | Run `docker compose up -d` and verify port 5432 |
| Emails not sending | Check SMTP settings; use MailHog in dev |
| Frontend 401 loops | Ensure `VITE_API_URL` matches API and CORS `WEB_URL` |
| Prisma client missing | Run `pnpm db:generate` |
| pnpm not found | Enable via `corepack enable` |

## License

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE.md) — free for non-commercial use; commercial use requires a separate license.
