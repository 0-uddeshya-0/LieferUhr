# Data Model

PostgreSQL schema managed by Prisma. See `prisma/schema.prisma` for the source of truth.

## Entities

### Organization

Top-level tenant. One organization has many users, suppliers, and orders.

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| name | string | Company name |
| email | string | Unique; used for digest emails |
| webhookUrl | string? | HTTPS endpoint for outbound events |
| webhookSecret | string? | HMAC signing secret (returned once) |

### User

Manager accounts. Belong to exactly one organization.

| Field | Type | Notes |
|-------|------|-------|
| email | string | Unique login |
| passwordHash | string | bcrypt, 12 rounds |
| orgId | FK | Organization |

### Supplier

Vendor contact within an organization.

| Field | Type | Notes |
|-------|------|-------|
| contactEmail | string | Notification target |
| contactName | string? | Greeting in emails |

### Order

Core tracking entity.

| Field | Type | Notes |
|-------|------|-------|
| orderNumber | string | Internal PO reference |
| valueCents | int? | Order value in euro cents; feeds "value at risk" |
| dueDate | DateTime | Requested delivery date |
| confirmedDate | DateTime? | Supplier-confirmed date (AB-Abgleich); later than dueDate ⇒ critical |
| status | OrderStatus | See enum below |
| magicToken | string | Unique URL token for supplier page |
| lastSupplierUpdate | DateTime? | Last supplier interaction |
| lastReminderSent | DateTime? | Last automated/manual reminder |
| reminderCount | int | Drives escalation logic |

### OrderStatus enum

`PENDING` → `RECEIVED` → `IN_PROGRESS` → `SHIPPED` / `DELAYED` → `DELIVERED` / `CANCELLED`

### ApiKey

Org-scoped API access for integrations. Only a SHA-256 hash is stored.

| Field | Notes |
|-------|-------|
| name | Human label, e.g. "ERP-Connector" |
| keyHash | Unique SHA-256 of the `lr_...` key |
| lastUsedAt | Updated on each authenticated request |

### Invite

Single-use team invitation, expires after 7 days.

| Field | Notes |
|-------|-------|
| email | Invitee address |
| token | Unique URL token (`/invite/:token`), `nanoid(32)` |
| expiresAt / acceptedAt | Validity window and single-use marker |

### OrderEvent

Audit trail of status changes.

| Field | Notes |
|-------|-------|
| status | Status at time of event |
| source | `supplier`, `manager`, or `system` |
| note | Optional reason text |

### Reminder

Email dispatch log.

| Field | Notes |
|-------|-------|
| type | `INITIAL`, `REMINDER_1`, `REMINDER_2`, `MANUAL` |
| emailTo | Recipient address |

## FrachtRadar entities

### FleetCustomer

Shipper customers of a carrier organization (distinct from `Supplier`, which
belongs to the purchasing product).

| Field | Notes |
|-------|-------|
| name | Company name (matched case-insensitively on CSV load import) |
| contactName / contactEmail | Receives the tracking link on dispatch |
| address | Printed on invoices |

### Driver

| Field | Notes |
|-------|-------|
| name / phone / email | Email receives dispatch + ping emails |
| licenseValidUntil | Führerschein expiry; surfaced in digest + overview when ≤ 30 days out |

### Vehicle

| Field | Notes |
|-------|-------|
| plate / type | Plate shown to driver on the tour page |
| nextInspectionAt | HU/TÜV date; same expiry surfacing as licenses |

### Load

A single pickup → delivery tour.

| Field | Notes |
|-------|-------|
| loadNumber | Carrier's own reference (free text) |
| customerId / driverId / vehicleId | All verified to belong to the org |
| pickupAt / pickupUntil, deliveryAt / deliveryUntil | Time windows |
| cargoDescription / weightKg / pallets | Freight details |
| priceCents | Net price; default for the invoice |
| status | `LoadStatus` enum below |
| driverToken / trackingToken | `nanoid(32)` capability tokens for `/t/` and `/l/` links |
| pickedUpAt / deliveredAt | Timestamps set by transitions |
| lastDriverUpdate / lastDriverPing / trackingSentAt | Automation bookkeeping |

#### LoadStatus enum

`NEW` → `DISPATCHED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED` → `INVOICED`,
plus `CANCELLED` (re-openable to `NEW`). Drivers may only advance
`DISPATCHED → PICKED_UP`, `PICKED_UP → IN_TRANSIT/DELIVERED`,
`IN_TRANSIT → DELIVERED`; dispatchers have the wider transition set
(including corrections like `DISPATCHED → NEW`).

### LoadEvent

Status audit trail per load. `source` is `dispatcher` or `driver`.

### PodUpload

Proof-of-delivery file (photo or PDF, max 5 MB).

| Field | Notes |
|-------|-------|
| fileName / filePath / mimeType | Stored under `UPLOAD_DIR/<orgId>/pods/`; filename randomized + sanitized |
| uploadedBy | `driver` (via `/t/:token`) |

### Invoice

One per load (`loadId` unique). Sequential `invoiceNumber` per org via
`Organization.nextInvoiceNumber` incremented inside a transaction.

| Field | Notes |
|-------|-------|
| invoiceNumber | `invoicePrefix` + 4-digit counter, unique per org |
| buyerName / buyerAddress | Snapshot of the customer at issue time |
| netCents / taxRateBps / grossCents | 19 % USt default; gross = net × (1 + bps/10000) |
| status | `ISSUED` → `PAID` |
| dueAt / pdfPath | Zahlungsziel; rendered PDF location |

`Organization` also carries billing fields for invoices: `street`, `zip`,
`city`, `taxId`, `invoicePrefix`, `nextInvoiceNumber`.

## Computed fields (not stored)

- **Delay risk** (`gruen` / `gelb` / `rot`) — computed from status, due date, reminders, supplier updates
- **Supplier scorecard** — on-time rate, avg response hours, responsiveness label

## Indexes

Orders indexed on `orgId`, `supplierId`, `status`, `dueDate` for dashboard queries.

## Seed data

`pnpm db:seed` creates:

- 1 organization (Muster Maschinenbau GmbH)
- 1 user (`manager@muster.de`)
- 3 suppliers
- 5 orders across different statuses
- 1 carrier organization (Spedition Berger GmbH, user `disponent@frachtradar.de`)
- 2 drivers, 2 vehicles, 2 shipper customers
- 3 loads across the status lifecycle (NEW / DISPATCHED / DELIVERED)
