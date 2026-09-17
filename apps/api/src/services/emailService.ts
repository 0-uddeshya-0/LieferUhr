import nodemailer from 'nodemailer';
import type { Order, Supplier, Organization, OrderStatus, Load, Driver, Vehicle, FleetCustomer } from '@prisma/client';
import { config } from '../config';
import { STATUS_LABELS, LOAD_STATUS_LABELS_DE } from '@lieferradar/shared';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  cc?: string;
}

export interface DigestData {
  totalActive: number;
  overdue: number;
  silentSuppliers: number;
  criticalOrders: Array<{
    orderNumber: string;
    supplierName: string;
    partDescription: string;
    dueDate: string;
    status: string;
  }>;
  unresponsiveSuppliers: Array<{ name: string; count: number }>;
  deliveredThisWeek: Array<{
    orderNumber: string;
    supplierName: string;
    partDescription: string;
  }>;
  fleet?: {
    openLoads: number;
    deliveredThisWeek: number;
    expiringDrivers: Array<{ name: string; until: string }>;
    expiringVehicles: Array<{ plate: string; until: string }>;
  };
}

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baseLayout(content: string, footerNote?: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;">
${content}
<p style="font-size:12px;color:#666;margin-top:30px;border-top:1px solid #eee;padding-top:15px;">
${footerNote ?? 'Diese E-Mail wurde von LieferRadar versendet.'}
<br>Bei Fragen wenden Sie sich bitte an den Besteller.
</p>
</body></html>`;
}

function ctaButton(url: string, label: string): string {
  return `<p style="text-align:center;margin:25px 0;">
<a href="${url}" style="background:#364fc7;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">${label}</a>
</p>`;
}

export async function sendEmail(template: EmailTemplate): Promise<void> {
  await transporter.sendMail({
    from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
    to: template.to,
    cc: template.cc,
    subject: template.subject,
    html: template.html,
  });
}

export function buildInitialNotification(
  order: Order & { supplier: Supplier; organization: Organization }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
  const greeting = order.supplier.contactName
    ? `Guten Tag ${escapeHtml(order.supplier.contactName)},`
    : 'Guten Tag,';

  const html = baseLayout(`
<h2>Bestellbestätigung anfragen</h2>
<p>${greeting}</p>
<p>${escapeHtml(order.organization.name)} bittet Sie um eine Statusaktualisierung für folgende Bestellung:</p>
<table style="width:100%;border-collapse:collapse;margin:15px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Bestellnr.</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(order.orderNumber)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Artikel</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(order.partDescription)}</td></tr>
${order.quantity ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Menge</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${order.quantity} ${escapeHtml(order.unit ?? '')}</td></tr>` : ''}
<tr><td style="padding:8px;"><strong>Liefertermin</strong></td><td style="padding:8px;">${dueDate}</td></tr>
</table>
${ctaButton(statusUrl, 'Status aktualisieren')}
<p style="font-size:13px;color:#666;">Bei Rückfragen antworten Sie einfach auf diese E-Mail.</p>
`, `Kontakt: ${escapeHtml(order.organization.email)}`);

  return {
    to: order.supplier.contactEmail,
    subject: `Bestellbestätigung anfragen – ${order.orderNumber} von ${order.organization.name}`,
    html,
  };
}

export function buildStatusUpdateAlert(
  order: Order & { supplier: Supplier; organization: Organization },
  newStatus: OrderStatus,
  note?: string | null
): EmailTemplate {
  const orderUrl = `${config.WEB_URL}/orders/${order.id}`;
  const statusLabel = STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] ?? newStatus;

  const html = baseLayout(`
<h2>Status aktualisiert</h2>
<p>Der Lieferant <strong>${escapeHtml(order.supplier.name)}</strong> hat den Status für Bestellung <strong>${escapeHtml(order.orderNumber)}</strong> aktualisiert.</p>
<p><strong>Neuer Status:</strong> ${statusLabel}</p>
${note ? `<p><strong>Anmerkung:</strong> ${escapeHtml(note)}</p>` : ''}
${ctaButton(orderUrl, 'Bestellung ansehen')}
`);

  const managerEmail = order.organization.email;
  return {
    to: managerEmail,
    subject: `Status aktualisiert: ${order.orderNumber} – ${statusLabel}`,
    html,
  };
}

export function buildReminder1(
  order: Order & { supplier: Supplier }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

  const html = baseLayout(`
<h2>Erinnerung: Status ausstehend</h2>
<p>Guten Tag,</p>
<p>wir möchten Sie freundlich daran erinnern, den Status für Bestellung <strong>${escapeHtml(order.orderNumber)}</strong> zu aktualisieren.</p>
<p>Geplanter Liefertermin: <strong>${dueDate}</strong></p>
${ctaButton(statusUrl, 'Status aktualisieren')}
`, 'Sie erhalten diese Erinnerung, weil noch kein Status gemeldet wurde. Bei Fragen wenden Sie sich bitte an den Besteller.');

  return {
    to: order.supplier.contactEmail,
    subject: `Erinnerung: Bitte Bestellstatus aktualisieren – ${order.orderNumber}`,
    html,
  };
}

export function buildReminder2(
  order: Order & { supplier: Supplier; organization: Organization }
): EmailTemplate {
  const statusUrl = `${config.WEB_URL}/s/${order.magicToken}`;
  const dueDate = order.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

  const html = baseLayout(`
<h2>Dringende Erinnerung</h2>
<p>Guten Tag,</p>
<p>der Status für Bestellung <strong>${escapeHtml(order.orderNumber)}</strong> steht weiterhin aus. Bitte aktualisieren Sie den Status umgehend.</p>
<p>Liefertermin: <strong>${dueDate}</strong></p>
${ctaButton(statusUrl, 'Jetzt Status aktualisieren')}
`, 'Diese E-Mail wurde automatisch versendet, da kein Status gemeldet wurde.');

  return {
    to: order.supplier.contactEmail,
    cc: order.organization.email,
    subject: `Dringende Erinnerung: Status ausstehend – ${order.orderNumber}`,
    html,
  };
}

export function buildUnresponsiveAlert(
  supplierName: string,
  orderCount: number,
  managerEmail: string
): EmailTemplate {
  const html = baseLayout(`
<h2>Lieferant antwortet nicht</h2>
<p>Der Lieferant <strong>${escapeHtml(supplierName)}</strong> hat auf <strong>${orderCount}</strong> Bestellung(en) nicht reagiert, trotz mehrfacher Erinnerungen.</p>
${ctaButton(`${config.WEB_URL}/suppliers`, 'Lieferantenübersicht öffnen')}
`);

  return {
    to: managerEmail,
    subject: `Lieferant antwortet nicht: ${supplierName} – ${orderCount} Bestellungen ausstehend`,
    html,
  };
}

export function buildWeeklyDigest(
  org: Organization,
  digestData: DigestData
): EmailTemplate {
  const criticalRows = digestData.criticalOrders
    .map(
      (o) =>
        `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(o.orderNumber)}</td><td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(o.supplierName)}</td><td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(o.partDescription)}</td><td style="padding:6px;border-bottom:1px solid #eee;">${o.dueDate}</td><td style="padding:6px;border-bottom:1px solid #eee;">${escapeHtml(o.status)}</td></tr>`
    )
    .join('');

  const unresponsiveList = digestData.unresponsiveSuppliers
    .map((s) => `<li>${escapeHtml(s.name)} (${s.count} Bestellungen)</li>`)
    .join('');

  const deliveredList = digestData.deliveredThisWeek
    .map((o) => `<li>${escapeHtml(o.orderNumber)} – ${escapeHtml(o.supplierName)}: ${escapeHtml(o.partDescription)}</li>`)
    .join('');

  const html = baseLayout(`
<h2>LieferRadar Wochenbericht</h2>
<p>Guten Tag,</p>
<h3>📊 Aktuelle Übersicht</h3>
<ul>
<li>${digestData.totalActive} aktive Bestellungen</li>
<li>${digestData.overdue} überfällig</li>
<li>${digestData.silentSuppliers} Lieferanten still</li>
</ul>
<h3>🔴 Kritische Bestellungen</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<thead><tr style="background:#f5f5f5;"><th style="padding:6px;text-align:left;">Bestellnr.</th><th style="padding:6px;text-align:left;">Lieferant</th><th style="padding:6px;text-align:left;">Artikel</th><th style="padding:6px;text-align:left;">Fällig</th><th style="padding:6px;text-align:left;">Status</th></tr></thead>
<tbody>${criticalRows || '<tr><td colspan="5" style="padding:10px;">Keine kritischen Bestellungen</td></tr>'}</tbody>
</table>
<h3>⚠️ Lieferanten ohne Reaktion</h3>
<ul>${unresponsiveList || '<li>Keine</li>'}</ul>
<h3>🟢 Diese Woche geliefert</h3>
<ul>${deliveredList || '<li>Keine Lieferungen</li>'}</ul>
${digestData.fleet ? `
<h3>🚚 Fuhrpark</h3>
<ul>
<li>${digestData.fleet.openLoads} offene Touren</li>
<li>${digestData.fleet.deliveredThisWeek} Touren diese Woche geliefert</li>
</ul>
${digestData.fleet.expiringDrivers.length || digestData.fleet.expiringVehicles.length ? `<h3>📄 Ablaufende Dokumente (30 Tage)</h3>
<ul>${digestData.fleet.expiringDrivers.map((d) => `<li>Führerschein ${escapeHtml(d.name)} – ${d.until}</li>`).join('')}${digestData.fleet.expiringVehicles.map((v) => `<li>HU/TÜV ${escapeHtml(v.plate)} – ${v.until}</li>`).join('')}</ul>` : ''}
${ctaButton(`${config.FLEET_URL}/dispatch`, 'Dispo-Board öffnen')}` : ''}
${ctaButton(`${config.WEB_URL}/dashboard`, 'Dashboard öffnen')}
`);

  return {
    to: org.email,
    subject: `LieferRadar Wochenbericht – ${digestData.overdue} Bestellungen überfällig`,
    html,
  };
}

// --- FrachtRadar (fleet) templates ---

export function buildDriverDispatchEmail(
  load: Load & { customer: FleetCustomer; driver: Driver; vehicle: Vehicle | null; organization: Organization }
): EmailTemplate {
  const url = `${config.FLEET_URL}/t/${load.driverToken}`;
  const fmtDate = (d: Date) =>
    d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });

  const html = baseLayout(`
<h2>Neue Tour: ${escapeHtml(load.loadNumber)}</h2>
<p>Guten Tag ${escapeHtml(load.driver.name)},</p>
<p>${escapeHtml(load.organization.name)} hat Ihnen eine Tour zugewiesen:</p>
<table style="width:100%;border-collapse:collapse;margin:15px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Abholung</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(load.pickupAddress)}<br>${fmtDate(load.pickupAt)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Zustellung</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(load.deliveryAddress)}<br>${fmtDate(load.deliveryAt)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Ladegut</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(load.cargoDescription)}</td></tr>
${load.vehicle ? `<tr><td style="padding:8px;"><strong>Fahrzeug</strong></td><td style="padding:8px;">${escapeHtml(load.vehicle.plate)}</td></tr>` : ''}
</table>
${ctaButton(url, 'Tour öffnen')}
<p style="font-size:13px;color:#666;">Kein Login nötig – Link tippen, Status melden, Abliefernachweis fotografieren. Link speichern: Seite zum Homescreen hinzufügen.</p>
`, `Kontakt: ${escapeHtml(load.organization.email)}`);

  return {
    to: load.driver.email!,
    subject: `Tour ${load.loadNumber}: ${load.pickupAddress} → ${load.deliveryAddress}`,
    html,
  };
}

export function buildDriverPingEmail(
  load: Load & { driver: Driver; organization: Organization }
): EmailTemplate {
  const url = `${config.FLEET_URL}/t/${load.driverToken}`;
  const html = baseLayout(`
<h2>Status ausstehend: Tour ${escapeHtml(load.loadNumber)}</h2>
<p>Guten Tag ${escapeHtml(load.driver.name)},</p>
<p>Bitte melden Sie den Status für diese Tour – die Abholung war geplant für ${load.pickupAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' })}.</p>
${ctaButton(url, 'Status melden')}
`, `Kontakt: ${escapeHtml(load.organization.email)}`);

  return {
    to: load.driver.email!,
    subject: `Status melden: Tour ${load.loadNumber}`,
    html,
  };
}

export function buildTrackingEmail(
  load: Load & { customer: FleetCustomer; organization: Organization }
): EmailTemplate {
  const url = `${config.FLEET_URL}/l/${load.trackingToken}`;
  const fmtDate = (d: Date) =>
    d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' });

  const html = baseLayout(`
<h2>Ihre Sendung ist unterwegs</h2>
<p>Guten Tag,</p>
<p>${escapeHtml(load.organization.name)} hat Ihre Sendung <strong>${escapeHtml(load.loadNumber)}</strong> disponiert:</p>
<table style="width:100%;border-collapse:collapse;margin:15px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Ladegut</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(load.cargoDescription)}</td></tr>
<tr><td style="padding:8px;"><strong>Zustellung geplant</strong></td><td style="padding:8px;">${fmtDate(load.deliveryAt)}</td></tr>
</table>
${ctaButton(url, 'Sendung verfolgen')}
<p style="font-size:13px;color:#666;">Live-Status und Abliefernachweis ohne Login.</p>
`, `Diese Benachrichtigung wurde von ${escapeHtml(load.organization.name)} via FrachtRadar versendet.`);

  return {
    to: load.customer.contactEmail!,
    subject: `Sendung ${load.loadNumber} unterwegs – ${load.organization.name}`,
    html,
  };
}

export function buildDriverStatusAlert(
  load: Load & { customer: FleetCustomer; driver: Driver | null; organization: Organization },
  newStatus: string,
  note?: string | null
): EmailTemplate {
  const url = `${config.FLEET_URL}/loads/${load.id}`;
  const label = LOAD_STATUS_LABELS_DE[newStatus as keyof typeof LOAD_STATUS_LABELS_DE] ?? newStatus;
  const html = baseLayout(`
<h2>Tour-Status aktualisiert</h2>
<p><strong>${escapeHtml(load.driver?.name ?? 'Fahrer')}</strong> hat Tour <strong>${escapeHtml(load.loadNumber)}</strong> gemeldet:</p>
<p><strong>Neuer Status:</strong> ${label}</p>
${note ? `<p><strong>Anmerkung:</strong> ${escapeHtml(note)}</p>` : ''}
${ctaButton(url, 'Tour ansehen')}
`);
  return {
    to: load.organization.email,
    subject: `Tour ${load.loadNumber}: ${label}`,
    html,
  };
}
