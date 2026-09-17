# FrachtRadar — Fleet/Carrier Expansion

Working name: **FrachtRadar** (same product family, adjustable). Status:
**implemented** — see [rollout-plan.md](rollout-plan.md) for the go-to-market
execution plan.

## Problem

Regional carriers with 3–30 trucks run dispatch on Excel + WhatsApp + paper.
The dispatcher's morning is a wall of paper; the customer's is "Wo ist mein
LKW?" phone calls; the driver's is a stack of delivery notes that come back to
the office days later — invoicing waits on them. Classic TMS (winSped, SAP TM,
Alpega) needs an implementation project and prices per module. SMB TMS
entrants (IMPARGO, DispoHub, Maxmove; US: TorqueTMS, TruckMaster Lite) still
assume the driver installs an app — the #1 adoption killer in fleets where
half the drivers are subcontractors on their own phones.

## Who we serve first (ICP)

Owner-managed **Fuhrunternehmen** in DACH: 3–30 trucks, 1–2 dispatchers,
regional/short-haul general cargo and part-loads, customers are local
Mittelstand shippers. Revenue comes from repeat lanes, not spot market. They
invoice per delivery against a signed Abliefernachweis, often weekly via
lexoffice/sevDesk/DATEV export or a Steuerberater. They will not run an
integration project, will not pay per-user licence fees, and their drivers
will not install a company app for a 3-truck fleet.

Explicitly not ICP: freight forwarders without own trucks, long-haul
FTL networks needing TIMOCOM/telematics depth, fleets >50 trucks that need
route optimisation, payroll and ELD/tacho integration.

## The wedge (same trick, new side)

LieferRadar proved it on the supplier side: **nobody logs in but us.**
FrachtRadar applies it to the driver and the shipper:

- **Driver magic link** (`/t/:token`): dispatcher sends one link per tour via
  WhatsApp/SMS/email. Driver taps → installable PWA, big status buttons
  (Abholung bestätigt → Unterwegs → Geliefert), photo upload for the signed
  delivery note. No app store, no account, persists on the home screen.
- **Shipper tracking link** (`/l/:token`): the carrier's customer gets a
  live status page instead of calling the dispatcher. POD available for
  download the moment it's photographed — the invoice can go out same day.

Every competitor leads with a driver *app*. A link the driver already knows
how to open (WhatsApp) is the adoption edge — same argument as the
supplier-side magic link.

## Competition, honestly

| Alternative | Why they pick it | Why we win anyway |
|---|---|---|
| Excel + WhatsApp + paper | Free, works | Removes the chasing (auto driver pings, doc-expiry alerts), not just the recording. POD→invoice same day is the cash-flow argument. |
| IMPARGO | German, SMB-priced, dispatch + telematics + toll | Broader suite; driver app + telematics hardware assume bigger ops. We ship link-only, live in an afternoon, cheaper entry. |
| DispoHub | €49/mo entry, drag-drop board, TIMOCOM inbox | Real competitor. Edge: driver needs no account/app, shipper tracking link included, and the shipper side (LieferRadar) already exists — network story they can't copy. |
| Maxmove | Cloud TMS + marketplace | Marketplace-first; we are ops-first for carriers who don't want to subcontract out. |
| winSped / classic TMS | Feature depth | Implementation projects, module pricing, on-prem legacy. Out of budget for ICP. |
| US small-fleet TMS (TorqueTMS, TruckMaster Lite) | Mature, cheap | US-only: DOT, IFTA, factoring, load boards. No German docs (Abliefernachweis, HU), no DSGVO story. |

The real competitor is still the status quo. Constraint: **adoptable from a
CSV export of customers + a phone number per driver, in one afternoon.**

## Scope — MVP (built now)

1. **Fleet registry**: drivers (name, phone, email, Führerschein expiry),
   vehicles (plate, type, HU/TÜV date), customers (shipper records) — CRUD +
   CSV import for customers.
2. **Loads/Touren**: load number, customer, pickup/delivery address + time
   windows, cargo (description, weight, pallets), price, driver+vehicle
   assignment, notes. Status machine:
   `NEW → DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED → INVOICED` (+
   `CANCELLED`). Full event timeline per load.
3. **Driver link** `/t/:token` (public, rate-limited, installable PWA):
   tour details, status buttons, POD photo upload (jpeg/png/heic, 5 MB).
4. **Tracking link** `/l/:token` (public, read-only): status, time windows,
   POD download when delivered. Sent automatically to customer contact on
   dispatch when an email exists.
5. **Dispatch board**: status columns/filters, KPIs (today's loads, unassigned,
   in transit, revenue this week), driver assignment inline.
6. **Invoicing**: one-click German invoice per delivered load — sequential
   invoice number per org (`RE-0001…`), seller/buyer blocks, 19 % USt,
   Zahlungsziel, PDF via pdfkit, ISSUED/PAID tracking. Org billing fields
   (address, Steuernr./USt-IdNr, prefix) in settings.
7. **Automation**: hourly job pings drivers on dispatched-but-not-picked-up
   loads; weekly digest extended with expiring Führerschein/HU dates and
   open loads. Webhook events `load.status_changed`,
   `load.driver_responded`, `invoice.issued` — same n8n/Make story.
8. **PWA**: installable, DE/EN, driver link persists on home screen.

## Explicitly not in MVP

Route optimisation, GPS/telematics live tracking, TIMOCOM/load boards,
multi-stop tours (single pickup→delivery per load for now), driver payroll,
fuel/toll, E-invoicing (ZUGFeRD/XRechnung), sub-carrier management, recurring
tour templates, native apps. Each is a roadmap candidate gated on pilot pull.

## Architecture — separate product, shared core

```
apps/web    LieferRadar (shipper product, :5173)   ─┐
apps/fleet  FrachtRadar (carrier product, :5174)   ─┤  same API + DB + auth
apps/api    adds /customers /drivers /vehicles     ─┤  one Organization can use
            /loads /invoices /t/:token /l/:token   ─┘  both products
packages/shared  + fleet zod schemas
```

One Fastify API, one Postgres, one login. The fleet app is a separate Vite
+PWA surface with its own landing page and positioning — deployed on its own
domain, cross-linked to LieferRadar. New env: `FLEET_URL` (link base),
`UPLOAD_DIR` (POD/invoice files), `FLEET_PING_CRON`.

New Prisma models: `FleetCustomer`, `Driver`, `Vehicle`, `Load`,
`LoadEvent`, `PodUpload`, `Invoice`. `Organization` gains billing fields
(`street`, `zip`, `city`, `taxId`, `invoicePrefix`, `nextInvoiceNumber`).
`Load.lastDriverPing` dedupes reminders; doc-expiry rides the existing
weekly digest (no new table).

## Integration into the current system (frictionless)

- Auth, org tenancy, team invites, API keys, webhooks, rate limiting,
  i18n, cron, email — all reused unchanged.
- Driver/tracking routes follow the supplier-status pattern exactly
  (public, token-scoped rate limit, 410 on closed).
- POD files on disk under `UPLOAD_DIR`, served through token-scoped and
  authed endpoints — no S3 dependency on a single-VPS deploy.
- `pnpm dev` unchanged; `pnpm dev:fleet` runs api+fleet, `dev:all` all three.

## Business model (hypothesis)

Per-vehicle pricing matches how carriers think: ~€15/truck/month, min.
€49/month, dispatchers unlimited, drivers and shippers free. 8-week pilot,
white-glove import of customers + drivers from Excel. Success metric agreed
up front: days-to-invoice, "wo ist mein LKW" calls/week, POD return time.
10 paying fleets ≈ €6–10k ARR — small, but this product also feeds
LieferRadar: every tracking link shown to a shipper is a demo of the
supplier-side product (two-sided network effect is the long-term moat).

## GTM

1. Pilot: 5 regional carriers via IHK-Verkehrsregionen, DSLV local groups,
   Facebook/WhatsApp groups for Fuhrunternehmer, personal referrals. Live
   demo with their own first tour entered on the call.
2. Repeatable: German SEO ("Abliefernachweis digital", "Dispositionssoftware
   kleine Spedition", "LKW Tracking Kunde"), Steuerberater and
   Fuhrpark-Versicherer as referral channels, cross-sell from LieferRadar
   shipper pilots ("your carriers can report status free").
3. Kill/continue after pilot phase: ≥60 % driver-link engagement within 4 h
   of dispatch, ≥50 % of PODs returned same-day, ≥2 fleets convert to paid.

## Top risks

1. **Driver link engagement** — older drivers, iOS quirkiness. Mitigate:
   dispatcher can always set status themselves (link is acceleration, not
   dependency); WhatsApp-first delivery.
2. **Crowded category** — DispoHub/IMPARGO are real. Edge stays narrow:
   link-not-app + shipper network + cheapest credible entry.
3. **POD photo quality/liability** — photo is a document copy, not the legal
   original; note in docs + keep originals wording on the driver page.
4. **Single-founder bandwidth, now ×2 products** — the fleet MVP must reuse
   ~80 % of existing machinery; if it can't, descope before shipping.
