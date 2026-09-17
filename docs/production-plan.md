# From demo surface to production product

The Pages demo is a presentation layer: `VITE_DEMO_MODE` swaps the HTTP API for
in-memory stores. Everything below makes the running product real, in an order
where each phase is independently shippable.

## Phase 0 — Production spine (done)

- All API routes under `/api`; same-origin deployment removes CORS as a
  failure mode and satisfies `SameSite=strict` cookies.
- `/healthz` + `/readyz` (DB ping) for container healthchecks and monitors.
- `apps/api/Dockerfile` — runs `prisma migrate deploy` on boot.
- `docker/site.Dockerfile` + `docker/nginx.conf` — one nginx serves both apps
  and proxies the API.
- `docker-compose.prod.yml` + `.env.prod.example` — single-VPS stack:
  db + api + site, TLS terminated in front.

## Phase 1 — Activation (next)

The demo shows value; production must get a real company to it.

1. **Self-serve signup** — org + first user in one flow; verify email via
   magic link (token infra already exists).
2. **Guided import** — CSV import exists for suppliers and fleet
   customers/drivers; add a first-run checklist (`hasSuppliers`, `hasOrders`,
   `hasDrivers` flags on the org) that renders the checklist UI until each
   step is done.
3. **Seed→real switch** — demo data is already shaped like API responses;
   keep the stores as pure fixtures and delete any demo-only fields that
   don't exist in the schema.
4. **Pilot cohort ops** — `docs/rollout-plan.md` covers the 8-week pilot;
   the technical ask is a `/api/pilot-request` endpoint (public, rate-limited)
   instead of mailto, so requests land in the DB.

## Phase 2 — Money

1. **Plans** — `Plan` enum on Organization (`PILOT`, `EINKAUF`, `FRACHT`,
   `BOTH`). Feature-gate routes server-side; product switcher in the shell.
2. **Billing** — Stripe (SEPA + invoice) or manual invoicing during pilots.
   Do not build billing UI until the first pilot asks to pay.
3. **Limits** — pilots: 5 suppliers / 3 drivers free; soft-caps enforced in
   services, not the UI.

## Phase 3 — The bridge (the actual product)

The umbrella story is "one delivery date, two sides." Today the two sides are
separate silos in one DB. The bridge:

1. `Order` (Einkauf) gains `carrierOrgId` — a purchasing org can hand a
   confirmed order to a carrier org as a `Load` draft.
2. `Load` gains `orderId` — POD and status flow back into the buyer's
   timeline automatically.
3. Directory: a carrier org can be invited by email; the load appears in
   their FrachtRadar board pre-filled.
4. Public tracking already exists — the buyer sees the carrier's live status
   without an account on the carrier's side.

This is the sequence where the platform stops being two apps and becomes the
network the landing page promises. Build it only after ≥3 pilots each side
exist — before that, the bridge has no traffic.

## Deliberately deferred

- **Object storage** — `UPLOAD_DIR` on a volume is correct for one VPS; S3
  when a second instance exists.
- **Worker split** — cron in-process is correct for one instance; extract
  when API count >1.
- **Driver token expiry** — tokens live as long as the tour; add
  `expiresAt` when links are reused beyond single tours.
- **Multi-domain branding** — custom domains per carrier org for tracking
  pages; a later retention feature, not launch-critical.
