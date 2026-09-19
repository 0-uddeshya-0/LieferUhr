# Betriebsamt — Suite Strategy

How the Lieferuhr platform expands from two freight products into a family of
back-office tools for German SMBs. This document separates **verified facts**
(with named sources) from **inference** and **open hypotheses**. Nothing here
is a promise — it is a decision basis to iterate against pilots.

Last updated: 2026 (research pass — market/competitor/naming, two parallel
research tracks, verified where possible by direct checks).

---

## 1. The product map

| Product | Cluster | Who it serves | The job it does |
|---|---|---|---|
| **Lieferuhr Einkauf** | Goods SMB | Purchasing/prod. teams, manufacturing SMEs | Supplier delay intelligence: order tracking, magic-link supplier status, delay risk |
| **FrachtRadar** | Carrier | Carriers, 3–30 trucks | Dispatch board, app-free driver links, tracking, POD, invoicing |
| **FrachtAmt** | Carrier | Carriers, 3–30 trucks | Reads freight offers (TIMOCOM-style + email), drafts counters, files order/POD paperwork, hands off to FrachtRadar |
| **PrüfAmt** | Carrier | Carriers + van fleets | Driving/rest-time clocks, document deadlines, audit pack — aimed at the July-2026 LCV tacho expansion |
| **EinsatzAmt** | Trades | Trades companies, 2–15 techs | Call-note/email → job card → technician + slot suggestion → confirmation draft |
| **PostAmt** | Goods SMB | Small wholesalers/warehouses, 2–10 staff | Order email → order draft → stock decrement → pick list/ship |

**Brand architecture (decided):** umbrella = **Betriebsamt — die Werkzeuge von
Lieferuhr**. Product names are an "Amt" family (FrachtAmt, PrüfAmt, EinsatzAmt,
PostAmt) plus the two flagship products keeping their names (Lieferuhr Einkauf,
FrachtRadar). Rationale: every "Amt" compound is a real or instantly-parseable
German word, carries the "an office that actually works" promise, and passed
collision screening where alternatives failed (FrachtPilot = existing ERP;
ServiceRadar = live OSS product; DepotRadar = Raiffeisen feature; the Lotse
family is occupied by betriebslotse.com's Pilot suite).

**Caveats to close before filing:** `betriebsamt.de` and `pruefamt.de` are
registered-but-parked (`.com` variants are free; `frachtamt.de`,
`einsatzamt.de` resolve free). "Amt" compounds are descriptive-adjacent — a
DPMA screening is still required; `PostAmt` is the weakest mark (common noun +
Deutsche Post proximity). Backup: Hobelbank umbrella with mixed product names
(EinsatzLotse, TachoRadar, Lagerschreiber, DispoLotse) — all collision-clean.

---

## 2. Market facts (verified, with sources)

### FrachtAmt (trucking dispatch AI)

- **US:** the wedge is enormous — traditional dispatchers charge **5–10% of
  gross** (TruckLeap, FF Dispatch et al.); an owner-op grossing $25k/mo pays
  ~$1,500/mo. AI-native entrants (Numeo $10–30/dispatcher/mo, Tiriel, VAU0)
  are compressing the price to $10–50/seat; Augment ($110M) and HappyRobot
  ($1.2B val) took the enterprise/mid-market lane.
- **DACH:** the 5–8% outsourced-dispatcher model **barely exists** — small
  carriers self-dispatch on TIMOCOM (58k+ customers, ~1M offers/day, ~€120–200
  /user/mo, annual contracts) via an in-house Disponent. "Replace your
  dispatcher" has no referent. The DACH product is an **AI
  Dispositionsassistent**: order-email capture + offer triage + counter-drafts
  + paperwork + handoff to dispatch — which overlaps FrachtRadar's surface.
- Adjacent DACH entrants: ESGO (empty-run monetization ~12% take), Klarfracht
  (KI-Auftragserfassung for 20–150 vehicle fleets), ProzessX (AI layer on
  CarLo/WinSped/TIMOCOM).

**Verdict: strong US / weak-moderate DACH standalone → ship as a FrachtRadar
companion in DACH.** The credible DACH story is "assists your Disponent,"
not "replaces a fee nobody pays."

### PrüfAmt (trucking compliance layer)

- **US:** real pain — ELDs record HOS but don't prevent violations; audits
  cite unannotated edits, uncertified logs, unassigned miles (49 CFR §395.8,
  §391; fines $1,099–$11,000 per missing item). Overlay competitors already
  exist (X3 Compass $25–50/driver/mo over Samsara/Motive/Geotab; Arrow;
  Fleetmule) and ELD vendors bundle copilot features.
- **DACH:** tacho/violation tooling is bundled into telematics subscriptions
  (VDO Fleet/TIS-Web, Webfleet, RIO, FleetBoard) — no standalone wedge for
  existing HGV fleets. **But:** from **July 2026**, EU tachograph rules extend
  to light commercial vehicles **>2.5t** in cross-border transport.
  **Correction (Sept 2026 review):** the earlier "unserved craftsmen" claim is
  wrong on both counts — Werkverkehr and craftsmen exemptions (Art. 3 VO
  561/2006) exclude most trades, and tooling is already cheap (Tachomotive
  €2–4/driver/mo with violation analysis, DAKO €9.75, VDO €6/veh/mo). The
  defensible slot is narrower: **cross-border commercial van freight**
  (licence-obligated since May 2022, tacho-obligated from July 2026) plus the
  document-deadline + audit-pack layer incumbents don't bundle.

**Verdict: moderate both markets — in DACH, aim at the 2026 LCV expansion, not
at fleets that already run VDO/Webfleet.**

### EinsatzAmt (trades service dispatch)

- **US:** most crowded of the four — Jobber (AI Receptionist +$99/mo),
  Housecall Pro (CSR AI bundled), ServiceTitan (Voice Agents) all ship the
  wedge feature natively. Standalone answering services (Sameday $449+/mo,
  Avoca ~$1B val) thrive anyway because missed-call economics are legible
  (20–35% of calls missed, ~75% never call back, ~$600 average ticket).
- **DACH:** ZVSHK data — **>60% of calls to Handwerksbetriebe go unanswered.**
  FSM incumbents (plancraft €48–140/mo, ToolTime, HERO — already ships a
  KI-Telefonassistent) plus a swarm of answering-bot startups (SpeakKI,
  telefon.ki, Callmify). **The unfilled gap: capture → structured job →
  routing into the Betrieb's actual disposition.** Bots stop at "summary SMS +
  calendar booking"; closing the loop is the differentiator.

**Verdict: weakest of the four standalone; enter only owning the
capture→job→route loop in DACH — which is exactly what the product surface
demonstrates.**

### PostAmt (SMB warehouse email orders)

- ~Half of B2B orders still arrive by email/PDF; re-keying takes 5–15
  min/order. The email-order pain lives in **B2B
  wholesalers/manufacturers/distributors** — the Mittelstand profile Lieferuhr
  Einkauf already sells to. E-comm SMBs are served fine by Zoho
  (free→$249/mo), inFlow, JTL (free–€369/mo, GoBD/DATEV), Billbee (€9+/mo).
- Workist (Berlin, €11.6M, Deutsche Bahn/PepsiCo customers) reads email orders
  into ERPs — **but requires an existing ERP**. The open slot: below Workist
  and beside JTL — for the non-ERP Betrieb. GoBD + DATEV + E-Rechnung
  (receipt mandatory since 2025, sending 2027–28) are table stakes and a
  selling hook.

**Verdict: strongest DACH fit of the four** — natural cross-sell from the
purchasing-side product; scope to B2B email orders for non-ERP SMBs, never
generic inventory.

### Does "AI reads the inbox and does back-office work" sell to SMBs?

Yes, with a pattern: **narrow scope, high volume, countable outcome**
(jobs booked, orders entered, loads negotiated), **supervised-by-default
autonomy** (Numeo's Manual→Supervised→Autonomous ladder), self-serve
onboarding under ~$100–300/mo. Horizontal "AI employee" pitches churn
brutally. Every product surface in `apps/suite` is built to that pattern:
drafts and suggestions, human clicks confirm.

---

## 3. Suite model (decided)

Research on suite pricing (Odoo One-App-Free, Zoho One all-employee, HubSpot
à-la-carte hubs) shows bundles only work when apps share a data spine **and**
the same buyer. Our six products span three buyer types — so:

- **À-la-carte per-product pricing on a shared account/data spine.** Each
  product must stand alone and sell alone.
- **Cluster bundles on renewal:**
  - *Carrier cluster:* FrachtRadar + FrachtAmt + PrüfAmt → per-truck bundle.
    **Correction:** €25–50/truck does not survive arithmetic — a DIY stack
    (DispoHub Pro €149 + Tachomotive €3×20 ≈ €10.45/truck) is cheaper. Target
    ~€10–15/truck or carry clear extra value (E-Rechnung, DATEV, filing).
  - *Goods-SMB cluster:* Lieferuhr Einkauf + PostAmt → flat €149–299/mo.
  - *Trades:* EinsatzAmt — **dropped from the suite** (see §8 decisions).
- **Data synergy is the real moat, not seat synergy:** PostAmt shipment events
  feed Einkauf's supplier-status picture; FrachtAmt bookings become
  FrachtRadar loads; PrüfAmt covers FrachtRadar drivers. Sell outcomes per
  product, bundle on renewal.
- Flat monthly pricing (SMB predictability) — never % of revenue, except
  possibly FrachtAmt where the incumbent mental model is %-based (keep an
  outcome-aligned option open).

## 4. Honest risk register

1. **Commoditization in real time** — Jobber, HCP, ServiceTitan, Foley,
   Tenstreet, TIMOCOM, JTL, plancraft/HERO are all shipping the wedge feature
   into products customers already pay for. A standalone tool must be 10×
   better to justify a second subscription.
2. **Well-funded entrants moving down-market** (HappyRobot, Augment, Avoca).
   Defense: be vertical-complete at SMB price points they won't bother with.
3. **SMB economics:** €100–300/mo ACVs can't support sales-led motion —
   self-serve onboarding (forward-your-last-10-orders pattern) is mandatory.
4. **Trust/liability:** an agent committing rates or inventory or missing an
   HOS violation creates real liability. **Supervised mode is not optional —
   it is the product.** All consequential actions are drafts pending human
   confirm.
5. **DACH specifics cut both ways:** GoBD/DATEV/DSGVO is a moat against US
   entrants and also build-cost; Mittelstand buys slowly, wants an
   Ansprechpartner, churns on English-first UX.

## 5. Prioritization (which wedge first)

| Rank | Product | Why |
|---|---|---|
| 1 | **PostAmt** | Strongest DACH fit; adjacent to existing Einkauf customers; proven email-order pain; self-serve onboarding pattern exists |
| 2 | **PrüfAmt** | July-2026 LCV tacho expansion = dated, unserved demand; low integration burden (document watch first, tacho feeds later) |
| 3 | **FrachtAmt** | Ships as FrachtRadar companion; assistive not replacement; DACH referent exists as Dispositionsassistent |
| 4 | **EinsatzAmt** | Only with the full capture→route loop closed; most crowded space |

Existing flagships keep their roadmap; the carrier cluster (2+3) is the first
bundle to sell because the buyer is the same person who already runs
FrachtRadar.

## 6. Validation questions (open hypotheses — test in pilots)

- Will a Disponent actually forward TIMOCOM offers to a tool, or does
  adoption require direct TIMOCOM/mail integration first?
- Do LCV >2.5t cross-border Betriebe even know the July-2026 rule hits them?
  (Demand-creation burden vs. demand-capture.)
- Is "supervised by default" accepted as a feature (trust) or friction
  (churn) at €100–200/mo?
- Does the PostAmt email→draft loop survive real order emails (mixed formats,
  partial SKUs, attachments) well enough to skip a validation-review step?
- Trades: is the calendar/disposition write-back into plancraft/HERO/ToolTime
  feasible, or does EinsatzAmt stay read-only + suggestion?

## 7. What ships now vs. later

**Now (this commit):** `apps/suite` — the Betriebsamt surface with one
signature workflow per tool (offer triage + counter draft + handoff; driver
clocks + doc traffic light + audit pack; inbox → job → tech/slot →
confirmation draft; mail → order draft → stock decrement → pick/ship), all
in-memory demo stores, DE/EN, independent routes, Pages-deployed under
`/LieferUhr/suite/`.

**Later (production spine, sequenced in
[production-plan.md](production-plan.md)):** shared org/account with
per-product entitlements → connector framework (mail ingest, TIMOCOM, ELD,
shipping) → agent runtime with approval queue + audit log → usage metering →
cluster bundles. None of the agent behaviors execute unsupervised actions in
the first production version.

---

## 8. Lineup decision — September 2026 review

Four independent reviews (market validation, UX/content audit, exec
CEO/CMO/CFO/COO review, system/integration audit) converged on the same call.

**The suite is two clusters, five tools — EinsatzAmt is demoted.**

- **Carrier cluster:** FrachtAmt → FrachtRadar → PrüfAmt (offer → tour →
  compliance), buyer: owner-managed Fuhrunternehmer 3–30 LKW.
- **Goods cluster:** Lieferuhr Einkauf + PostAmt (order intake → secured
  date), buyer: Einkauf / Großhandel / Lager.
- **EinsatzAmt:** different buyer (trades), most crowded market (plancraft
  ships KI-Empfang free, HERO ships a KI-Telefonassistent, ToolTime), zero
  shared data spine with the other five, and its differentiator (write-back
  into plancraft/HERO disposition) is an unproven hypothesis. It stays
  deployed and reachable in the suite under an explicit "Experiment" label —
  zero founder hours, revisit only on inbound pull.

**GTM lead:** FrachtRadar — the only production-grade product (API + DB +
tests), a mechanically verifiable wedge (link-only driver flow; every
competitor requires an app install), proven segment pricing (DispoHub
€49–299, IMPARGO €34.90–179.90 + free tier). PostAmt is the fast-follow
suite tool, **gated on a validation pilot**: run `extractOrderLines` against
10 real order mails each from 2–3 wholesalers before building the backend.

**Copy rules adopted:** lead with "Entwürfe statt Abtippen — nichts geht
raus ohne Ihr OK" instead of "KI" (extraction is deterministic rules +
lexicons today, and supervised-by-default is the trust story); drop TIMOCOM,
GoBD and "Tour angelegt" claims until built; BALM not BAG; no "CSV export"
claim (doesn't exist); pricing on paper only when pilots ask.
