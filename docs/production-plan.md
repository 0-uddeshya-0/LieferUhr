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

## Phase 4 — Betriebsamt (the tool family)

`apps/suite` exists as a demo surface. Making the four tools real is a
different spine than the CRUD apps — every tool is an *agent over a channel*
(mail, load board, ELD, calendar) that produces drafts a human approves.
Build order, each step shippable:

1. **Shared account + entitlements** — one org, per-product `Plan` flags
   (`EINKAUF`, `FRACHT`, `AMT_FRACHT`, `AMT_PRUEF`, `AMT_EINSATZ`, `AMT_POST`).
   The product switcher in the suite shell reads flags; routes gate
   server-side. No cross-product data migration — tools read the org's own
   tables.
2. **Connector framework** — one `Connector` table (type, credentials ref,
   orgId, status) + per-type adapters, because every tool starts the same
   way: mail ingest (IMAP/forward-to-`@in.betriebsamt` address), then
   TIMOCOM/ELD/calendar/shipping adapters only when a pilot asks.
3. **Agent runtime + approval queue** — extracted `Document` → `Proposal`
   (draft action: counter-mail, job booking, order draft, audit pack) →
   human `Approve/Reject` → `Action` executes + `AuditEvent` log. This is
   the safety model from [suite-strategy.md](suite-strategy.md): supervised
   by default is the product, not a setting.
4. **Domain modules** — per-tool schemas sit beside, not inside, the
   existing models: `AmtOffer`/`AmtCounter` (FrachtAmt, links to `Load` on
   handoff), `DriverClock`/`ComplianceDoc` (PrüfAmt, reuses fleet
   drivers/vehicles when the org has FRACHT), `ServiceRequest`/`ServiceJob`
   (EinsatzAmt), `InboundMail`/`OrderDraft`/`StockItem` (PostAmt, emits
   `Shipment` events Einkauf can consume).
5. **Usage metering** — proposals executed per tool per month; pricing is
   flat monthly with soft caps (see suite-strategy §3).

Build the connector + approval spine once, then the tools in pilot order
(PostAmt → PrüfAmt → FrachtAmt; EinsatzAmt is demoted — see
[suite-strategy.md](suite-strategy.md) §8 — so it only builds on inbound
pull).

**Minimal schema sketch** (validated against the September-2026 integration
audit — everything below is additive; nothing in the current schema blocks
it):

- `Connector` (orgId, type `FORWARD_ADDRESS|IMAP|TIMOCOM_FORWARD`,
  credentialsRef, status) + `InboundDocument` (orgId, connectorId,
  rawPayload, receivedAt). Public ingest `POST /inbound/:token` reuses the
  existing capability-token pattern.
- `Proposal` (orgId, tool, kind `order_draft|counter_offer|job_booking|
  audit_pack`, payload, extraction/confidence, status `DRAFT|APPROVED|
  REJECTED`, decidedBy/At) + `AuditEvent` — the approval backend; approving
  writes the domain entity and an `OrderEvent`/`LoadEvent` with
  `source:'agent'` (the `source` string already exists, no migration).
- PostAmt: `StockItem` + `StockMovement`; an approved `order_draft` maps to
  `fleetService.createLoad` for the shipment leg — PostAmt→carrier reuses
  the entire dispatch/POD/invoice chain untouched.
- FrachtAmt: `AmtOffer`/`AmtCounter`; `won` + approve → `createLoad` — the
  `/t/` driver link, `/l/` tracking link and `load.*` webhooks come free.
- Link fields per Phase 3: `Load.orderId` (intra-org write-back: delivered
  → linked order event → `order.status_changed` webhook) and
  `Order.carrierOrgId` (cross-org handoff → load lands as draft on the
  carrier's board).

## Deliberately deferred

- **Object storage** — `UPLOAD_DIR` on a volume is correct for one VPS; S3
  when a second instance exists.
- **Worker split** — cron in-process is correct for one instance; extract
  when API count >1.
- **Driver token expiry** — tokens live as long as the tour; add
  `expiresAt` when links are reused beyond single tours.
- **Multi-domain branding** — custom domains per carrier org for tracking
  pages; a later retention feature, not launch-critical.
