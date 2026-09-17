# FrachtRadar — Market Rollout Plan

> **Suite note (2026):** FrachtRadar is now one product inside the Betriebsamt
> family — see [suite-strategy.md](suite-strategy.md) for the cluster model
> (FrachtRadar + FrachtAmt + PrüfAmt as the carrier bundle). This plan still
> governs the first-pilot motion; the suite adds cross-sell once a carrier is
> live.

Goal: **5 pilot carriers live within 8 weeks, ≥2 paying within 12.**
Everything below is sized for one founder, part-time. If a task can't be done
this week with a phone and a laptop, it doesn't belong here.

## The pitch (one line)

> "Ihre Fahrer melden den Status per Link — ohne App, ohne Login. Ihre Kunden
> sehen live, wo die Tour steht. Und der Abliefernachweis kommt als Foto
> zurück, sobald unterschrieben ist — die Rechnung kann noch am selben Tag raus."

Three pain anchors, in the order dispatchers feel them:

1. **"Wo ist mein LKW?"-Anrufe** — the tracking link kills the call before it
   happens. Sell the silence.
2. **Abliefernachweis kommt Tage später** — POD photo at the delivery door =
   invoice out same day = cash-flow argument. This is the closest thing to a
   quantifiable ROI: days-to-invoice.
3. **Führerschein/HU läuft ab und keiner merkt es** — the weekly digest
   catches it. Small feature, high trust signal ("die denkt mit").

What NOT to lead with: dashboards, KPIs, "digitale Transformation". The demo
is the pitch — enter one of *their* real tours live on the call (2 min),
send the driver link to the dispatcher's own phone, let them tap through it.
If the link doesn't wow them on their own phone, no slide will.

## Who to call (ICP, sharpened)

- Owner-managed Fuhrunternehmen, **3–30 LKW**, regional Stückgut/Teilladungen
- 1–2 Disponenten, usually the owner or family
- Customers are local Mittelstand shippers — recurring lanes, not spot
- Excel/Papier/WhatsApp today; no TMS, or a TMS they pay for but don't use
- **Not:** forwarders without own trucks, >50 trucks, long-haul/telematics
  shops, anyone who says "wir haben schon ein TMS und sind zufrieden"

Trigger signals that make a call warm: job posts for
"Disponent/Kraftfahrer" (they're growing or churned), new vehicles in the
Fuhrpark (Handelsregister/website news), companies that just lost a driver.

## Where to find them (channels, ranked by effort-to-yield)

| Channel | How | Expected yield |
|---|---|---|
| Personal network / warm intros | Ask every Lieferuhr contact, supplier, Steuerberater: "Kennen Sie einen Fuhrunternehmer?" | Highest close rate; limited volume |
| Google Maps sweep | "Spedition" + "Transport" per region (Augsburg, Ulm, Donauwörth…), filter by size signals (own Fuhrpark photos, no corporate branding) → 30 min/list of 50 | ~1 in 15 calls becomes a demo |
| IHK Verkehrsregionen + DSLV regional events | Member directories are public-ish; attend one Verkehrs-Unternehmer-Stammtisch | Slow but credible |
| Facebook/WhatsApp/Instagram groups | "Fuhrunternehmer", "LKW-Fahrer", "Spedition" groups — observe 2 weeks, then post value-first (e.g. free POD template) | Scrappy, real reach to exactly the ICP |
| Steuerberater / Fuhrpark-Versicherer | They see the paper chaos first; offer referral or co-branding | Medium-term channel |
| TIMOCOM-adjacent SMBs | Companies posting "wir suchen Subunternehmer" — already ops-savvy | Qualified but sales-aware |
| German SEO (weeks 4+, passive) | "Abliefernachweis digital", "Dispositionssoftware kleine Spedition", "LKW Tracking für Kunden", "Tourenverwaltung Excel Alternative" | Compounds; zero now |

## Pilot offer (the deal you put on the table)

- **8 weeks free**, incl. white-glove setup: you import their customer list +
  driver roster from Excel *on the kickoff call* (that's the CSV import's job)
- No credit card, no contract, they keep their invoice PDFs
- In return: 30-min weekly feedback call + permission to use them as
  reference (logo + one quote) *if* they're happy
- Success metric agreed up front, in writing: driver-link engagement,
  days-to-invoice, "wo ist mein LKW"-calls per week

Pricing after pilot (hypothesis to validate, not gospel): **€15/LKW/month,
min. €49/mo**, unlimited dispatchers, drivers and shippers free. First price
is allowed to be wrong — measure willingness by asking "was würden Sie
zahlen, wenn es X erspart?" in week 4 of every pilot.

## Execution checklist

### Week 0 — readiness (do before first call)

- [ ] Demo account loaded with a realistic fleet (seed: Spedition Berger)
- [ ] One real phone-tested run: WhatsApp yourself a driver link on iOS *and*
  Android, tap through pickup→POD→delivered on mobile data
- [ ] One-pager (A4 PDF, DE): 3 pain anchors, screenshot of driver link +
  tracking page, pilot offer, contact. Print 20 copies.
- [ ] Landing page live at the fleet domain (`index.html` + manifest already
  exist; deploy = nginx site, see docs/deployment.md)
- [ ] List of 50 target carriers with phone numbers (Maps sweep, 2 evenings)
- [ ] Invoice PDF checked against §14 UStG by someone who knows: full
  address, Steuernummer/USt-IdNr, sequential number, Leistungsdatum —
  current template covers these; have a Steuerberater eyeball it once

### Weeks 1–2 — first contact wave

- [ ] Call 10 carriers/day, 4 days. Script skeleton:
  1. "Machen Sie Ihre Disposition noch in Excel?" (qualify in 10 s)
  2. "Wie oft ruft ein Kunde an und fragt, wo der LKW ist?" (pain)
  3. "Ich zeig Ihnen in 2 Minuten was — geht per Telefon direkt?" (demo ask)
- [ ] Every demo: create *their* tour live, send driver link to *their*
  phone via WhatsApp. Book the 8-week pilot on the spot.
- [ ] Log every "no" with the reason — the objection list below grows here

### Weeks 3–6 — pilot operation

- [ ] Kickoff per pilot: import customers + drivers (CSV), create first real
  tour together, send first tracking link to their real customer
- [ ] Weekly 30-min call: what broke, what did the driver say, what did the
  customer say. Feed everything into the issue tracker the same day.
- [ ] Ship fixes weekly; pilots forgive bugs, they don't forgive silence
- [ ] Week 4: the money conversation (see pricing above)

### Weeks 7–8 — convert or learn

- [ ] Ask each pilot: paid yes/no + the one feature that would change the
  answer
- [ ] Publish 1–2 reference quotes (with permission)
- [ ] Go/no-go against the metrics below

## Kill / continue metrics (measured, not vibes)

| Signal | Green | Red |
|---|---|---|
| Driver-link engagement | ≥60 % of dispatched loads get a driver status update within 4 h | <30 % — the wedge failed, rethink driver UX |
| POD same-day return | ≥50 % | <25 % — POD value prop unproven |
| Pilot → paid conversion | ≥2 of 5 | 0 — pricing or value wrong |
| Dispatcher weekly active | ≥4 days/week during pilot | <2 — tool isn't in the daily loop |

## Objection handling (expected)

- **"Meine Fahrer sind zu alt dafür."** — The link opens in WhatsApp like any
  link; if they can answer WhatsApp, they can use it. And the dispatcher can
  always set status themselves — nothing breaks if a driver never taps.
- **"Wir haben schon DispoHub/IMPARGO."** — Are the drivers actually using
  the app? Tracking link for customers included? Offer to run one lane
  alongside for 8 weeks, free.
- **"Was kostet das?"** — Nothing during the pilot; after that less than one
  phone call saved per truck per day. (€15/truck ≈ 50 ct/day.)
- **"DSGVO? Wo liegen die Daten?"** — Germany (Hetzner), AVV template ready,
  org data deletable on request. This is a *selling point* vs. US tools.
- **"Der Abliefernachweis muss doch Papier sein."** — The photo is a working
  copy for invoicing speed; the paper original still comes back normally.
  Position it as acceleration, not replacement.

## What the shipper side does for this product

Every tracking link a carrier sends exposes a Mittelstand shipper to the
"Radar" family. Track it: log when a `/l/:token` viewer's domain later signs
up to Lieferuhr. That two-sided pull is the moat — competitors can copy a
driver link in a quarter; they can't copy a network.

## Explicitly deferred (say no for now)

Route optimisation, GPS/telematics, multi-stop tours, TIMOCOM/load board,
driver payroll, ZUGFeRD/XRechnung e-invoicing, native apps, sub-carrier
management, English-only expansion beyond DACH. Revisit each only when ≥2
pilots independently ask for it.
