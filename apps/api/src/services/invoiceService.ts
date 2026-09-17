import PDFDocument from 'pdfkit';
import { mkdirSync } from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import { prisma } from '../db';
import { config } from '../config';

function eur(cents: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export async function issueInvoice(
  orgId: string,
  loadId: string,
  opts: { netCents?: number; taxRateBps: number; dueDays: number }
) {
  const load = await prisma.load.findFirst({
    where: { id: loadId, orgId },
    include: { customer: true, organization: true, invoice: true },
  });
  if (!load) return { error: 'not_found' as const };
  if (load.status !== 'DELIVERED' && load.status !== 'INVOICED') {
    return { error: 'load_not_delivered' as const };
  }
  if (load.invoice) return { error: 'already_invoiced' as const };

  const netCents = opts.netCents ?? load.priceCents;
  if (netCents === undefined || netCents === null) {
    return { error: 'no_price' as const };
  }
  const grossCents = Math.round(netCents * (1 + opts.taxRateBps / 10000));

  // Sequential invoice number per org, inside a transaction.
  const invoice = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: orgId },
      data: { nextInvoiceNumber: { increment: 1 } },
    });
    const invoiceNumber = `${org.invoicePrefix}${String(org.nextInvoiceNumber - 1).padStart(4, '0')}`;
    const dueAt = new Date(Date.now() + opts.dueDays * 24 * 60 * 60 * 1000);
    return tx.invoice.create({
      data: {
        orgId,
        loadId,
        invoiceNumber,
        buyerName: load.customer.name,
        buyerAddress: load.customer.address ?? undefined,
        netCents,
        taxRateBps: opts.taxRateBps,
        grossCents,
        dueAt,
      },
    });
  });

  await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'INVOICED',
      events: { create: { status: 'INVOICED', note: `Rechnung ${invoice.invoiceNumber}`, source: 'dispatcher' } },
    },
  });

  const pdfPath = await renderInvoicePdf(invoice.id);
  return { invoice: await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfPath } }) };
}

export async function renderInvoicePdf(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { load: { include: { customer: true } }, organization: true },
  });
  if (!invoice) throw new Error('invoice not found');

  const org = invoice.organization;
  const load = invoice.load;
  const dir = path.join(config.UPLOAD_DIR, invoice.orgId, 'invoices');
  mkdirSync(dir, { recursive: true });
  // invoiceNumber derives from the org-configurable prefix — keep the
  // filesystem name safe regardless of what was stored.
  const safeNumber = invoice.invoiceNumber.replace(/[^A-Za-z0-9._-]/g, '_');
  const filePath = path.join(dir, `${safeNumber}.pdf`);

  const net = eur(invoice.netCents);
  const taxAmount = eur(invoice.grossCents - invoice.netCents);
  const gross = eur(invoice.grossCents);
  const taxRate = (invoice.taxRateBps / 100).toFixed(0);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text(org.name, { align: 'left' });
    const sellerLines = [org.street, [org.zip, org.city].filter(Boolean).join(' ')].filter(Boolean);
    if (sellerLines.length) doc.fontSize(10).text(sellerLines.join('\n'));
    if (org.taxId) doc.fontSize(10).text(`Steuernummer/USt-IdNr.: ${org.taxId}`);
    doc.text(`E-Mail: ${org.email}`);
    doc.moveDown(2);

    doc.fontSize(10).text('An:', 50, doc.y);
    doc.fontSize(11).text(invoice.buyerName);
    if (invoice.buyerAddress) doc.fontSize(10).text(invoice.buyerAddress);
    doc.moveDown(2);

    doc.fontSize(14).text(`Rechnung ${invoice.invoiceNumber}`);
    doc.fontSize(10).text(`Rechnungsdatum: ${fmtDate(invoice.issuedAt)}`);
    doc.text(`Leistungsdatum: ${load.deliveredAt ? fmtDate(load.deliveredAt) : fmtDate(invoice.issuedAt)}`);
    doc.moveDown();

    doc.fontSize(10);
    const tableTop = doc.y;
    doc.text('Pos.', 50, tableTop).text('Beschreibung', 90, tableTop).text('Betrag', 450, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, tableTop + 14).lineTo(550, tableTop + 14).stroke();
    const cargoBits = [
      load.cargoDescription,
      load.pallets ? `${load.pallets} Palette(n)` : null,
      load.weightKg ? `${load.weightKg} kg` : null,
    ].filter(Boolean).join(' · ');
    doc.text('1', 50, tableTop + 24);
    doc.text(`Frachtleistung ${load.loadNumber}\n${load.pickupAddress} → ${load.deliveryAddress}\n${cargoBits}`, 90, tableTop + 24, { width: 340 });
    doc.text(net, 450, tableTop + 24, { width: 100, align: 'right' });

    const sumTop = doc.y + 20;
    doc.moveTo(350, sumTop).lineTo(550, sumTop).stroke();
    doc.text('Netto:', 350, sumTop + 8).text(net, 450, sumTop + 8, { width: 100, align: 'right' });
    doc.text(`USt. ${taxRate}%:`, 350, sumTop + 24).text(taxAmount, 450, sumTop + 24, { width: 100, align: 'right' });
    doc.font('Helvetica-Bold').text('Gesamt:', 350, sumTop + 40).text(gross, 450, sumTop + 40, { width: 100, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(3);
    doc.fontSize(10).text(`Zahlbar innerhalb von ${Math.max(0, Math.round((invoice.dueAt!.getTime() - invoice.issuedAt.getTime()) / 86400000))} Tagen ohne Abzug${invoice.dueAt ? ` (bis ${fmtDate(invoice.dueAt)})` : ''}.`);
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#666').text('Abliefernachweis liegt dem Auftrag bei und kann auf Anfrage bereitgestellt werden.');

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  return filePath;
}
