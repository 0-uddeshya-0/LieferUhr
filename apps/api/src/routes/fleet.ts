import type { FastifyInstance } from 'fastify';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse/sync';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CreateDriverSchema,
  UpdateDriverSchema,
  CreateVehicleSchema,
  UpdateVehicleSchema,
  CreateLoadSchema,
  UpdateLoadSchema,
  AssignLoadSchema,
  UpdateLoadStatusSchema,
  IssueInvoiceSchema,
  CustomerCsvRowSchema,
  LoadCsvRowSchema,
} from '@lieferradar/shared';
import type { LoadStatus } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/requireAuth';
import * as fleetService from '../services/fleetService';
import * as invoiceService from '../services/invoiceService';
import { buildDriverDispatchEmail, buildDriverPingEmail, buildTrackingEmail, sendEmail } from '../services/emailService';
import { dispatchWebhook, loadWebhookPayload } from '../services/webhookService';

const MAX_CSV_SIZE = 5 * 1024 * 1024;

export async function fleetRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // --- Customers (shippers of this carrier) ---
  app.get('/customers', async (request) => {
    return prisma.fleetCustomer.findMany({
      where: { orgId: request.user.orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { loads: true } } },
    });
  });

  app.post('/customers', async (request, reply) => {
    const body = CreateCustomerSchema.parse(request.body);
    const customer = await prisma.fleetCustomer.create({
      data: { ...body, contactEmail: body.contactEmail || null, orgId: request.user.orgId },
    });
    return reply.status(201).send(customer);
  });

  app.patch('/customers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateCustomerSchema.parse(request.body);
    const res = await prisma.fleetCustomer.updateMany({
      where: { id, orgId: request.user.orgId },
      data: { ...body, contactEmail: body.contactEmail === '' ? null : body.contactEmail },
    });
    if (!res.count) return reply.status(404).send({ error: 'Kunde nicht gefunden' });
    return prisma.fleetCustomer.findUnique({ where: { id } });
  });

  app.delete('/customers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await prisma.fleetCustomer.deleteMany({ where: { id, orgId: request.user.orgId } });
    if (!res.count) return reply.status(404).send({ error: 'Kunde nicht gefunden' });
    return { success: true };
  });

  app.post('/customers/import', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'Keine Datei hochgeladen' });
    const buffer = await data.toBuffer();
    if (buffer.length > MAX_CSV_SIZE) return reply.status(400).send({ error: 'Datei zu groß (max. 5 MB)' });
    if (!['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'].includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Ungültiger Dateityp' });
    }
    let rows: Record<string, string>[];
    try {
      rows = parse(buffer.toString('utf-8'), { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      return reply.status(400).send({ error: 'CSV konnte nicht gelesen werden' });
    }
    if (rows.length > 500) return reply.status(400).send({ error: 'Maximal 500 Zeilen pro Import' });
    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;
    for (let i = 0; i < rows.length; i++) {
      const parsed = CustomerCsvRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push({ row: i + 2, message: parsed.error.issues[0]?.message ?? 'Ungültige Zeile' });
        continue;
      }
      await prisma.fleetCustomer.create({
        data: { ...parsed.data, contactEmail: parsed.data.contactEmail || null, orgId: request.user.orgId },
      });
      imported++;
    }
    return { imported, errors };
  });

  // --- Drivers ---
  app.get('/drivers', async (request) => {
    return prisma.driver.findMany({
      where: { orgId: request.user.orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { loads: { where: { status: { notIn: ['DELIVERED', 'INVOICED', 'CANCELLED'] } } } } } },
    });
  });

  app.post('/drivers', async (request, reply) => {
    const body = CreateDriverSchema.parse(request.body);
    const driver = await prisma.driver.create({
      data: {
        ...body,
        email: body.email || null,
        licenseValidUntil: body.licenseValidUntil ? new Date(body.licenseValidUntil) : null,
        orgId: request.user.orgId,
      },
    });
    return reply.status(201).send(driver);
  });

  app.patch('/drivers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateDriverSchema.parse(request.body);
    const res = await prisma.driver.updateMany({
      where: { id, orgId: request.user.orgId },
      data: {
        ...body,
        email: body.email === '' ? null : body.email,
        licenseValidUntil: body.licenseValidUntil ? new Date(body.licenseValidUntil) : undefined,
      },
    });
    if (!res.count) return reply.status(404).send({ error: 'Fahrer nicht gefunden' });
    return prisma.driver.findUnique({ where: { id } });
  });

  app.delete('/drivers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await prisma.driver.deleteMany({ where: { id, orgId: request.user.orgId } });
    if (!res.count) return reply.status(404).send({ error: 'Fahrer nicht gefunden' });
    return { success: true };
  });

  // --- Vehicles ---
  app.get('/vehicles', async (request) => {
    return prisma.vehicle.findMany({
      where: { orgId: request.user.orgId },
      orderBy: { plate: 'asc' },
    });
  });

  app.post('/vehicles', async (request, reply) => {
    const body = CreateVehicleSchema.parse(request.body);
    const vehicle = await prisma.vehicle.create({
      data: {
        ...body,
        nextInspectionAt: body.nextInspectionAt ? new Date(body.nextInspectionAt) : null,
        orgId: request.user.orgId,
      },
    });
    return reply.status(201).send(vehicle);
  });

  app.patch('/vehicles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateVehicleSchema.parse(request.body);
    const res = await prisma.vehicle.updateMany({
      where: { id, orgId: request.user.orgId },
      data: {
        ...body,
        nextInspectionAt: body.nextInspectionAt ? new Date(body.nextInspectionAt) : undefined,
      },
    });
    if (!res.count) return reply.status(404).send({ error: 'Fahrzeug nicht gefunden' });
    return prisma.vehicle.findUnique({ where: { id } });
  });

  app.delete('/vehicles/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await prisma.vehicle.deleteMany({ where: { id, orgId: request.user.orgId } });
    if (!res.count) return reply.status(404).send({ error: 'Fahrzeug nicht gefunden' });
    return { success: true };
  });

  // --- Loads ---
  app.get('/loads', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    return fleetService.listLoads(request.user.orgId, {
      status: query.status as LoadStatus | undefined,
      driverId: query.driverId,
      customerId: query.customerId,
      unassignedOnly: query.unassignedOnly === 'true',
      search: query.search,
    });
  });

  app.post('/loads', async (request, reply) => {
    const body = CreateLoadSchema.parse(request.body);
    const result = await fleetService.createLoad(request.user.orgId, body);
    if ('error' in result) {
      return reply.status(400).send({ error: 'Ungültige Referenz (Kunde/Fahrer/Fahrzeug)' });
    }
    const load = result;
    if (load.driver?.email) {
      const full = await prisma.load.findUniqueOrThrow({
        where: { id: load.id },
        include: { customer: true, driver: true, vehicle: true, organization: true },
      });
      void sendEmail(buildDriverDispatchEmail(full as Parameters<typeof buildDriverDispatchEmail>[0])).catch(() => {});
    }
    request.log.info({ orgId: request.user.orgId, loadId: load.id }, 'Load created');
    return reply.status(201).send(load);
  });

  app.get('/loads/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const load = await fleetService.getLoadById(request.user.orgId, id);
    if (!load) return reply.status(404).send({ error: 'Tour nicht gefunden' });
    return load;
  });

  app.patch('/loads/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateLoadSchema.parse(request.body);
    const result = await fleetService.updateLoad(request.user.orgId, id, body);
    if ('error' in result) {
      return reply
        .status(result.error === 'not_found' ? 404 : 400)
        .send({ error: result.error === 'not_found' ? 'Tour nicht gefunden' : 'Ungültige Referenz (Kunde)' });
    }
    return result;
  });

  app.post('/loads/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = AssignLoadSchema.parse(request.body ?? {});
    const result = await fleetService.assignLoad(
      request.user.orgId,
      id,
      body.driverId ?? null,
      body.vehicleId ?? null
    );
    if ('error' in result) {
      return reply
        .status(result.error === 'not_found' ? 404 : 400)
        .send({ error: result.error === 'not_found' ? 'Tour nicht gefunden' : 'Ungültige Referenz (Fahrer/Fahrzeug)' });
    }
    const load = result;
    if (body.sendDriverEmail && load.driver?.email && load.status === 'DISPATCHED') {
      const full = await prisma.load.findUniqueOrThrow({
        where: { id: load.id },
        include: { customer: true, driver: true, vehicle: true, organization: true },
      });
      void sendEmail(buildDriverDispatchEmail(full as Parameters<typeof buildDriverDispatchEmail>[0])).catch(() => {});
      if (full.customer.contactEmail && !full.trackingSentAt) {
        void sendEmail(buildTrackingEmail(full as Parameters<typeof buildTrackingEmail>[0])).catch(() => {});
        await prisma.load.update({ where: { id: load.id }, data: { trackingSentAt: new Date() } });
      }
    }
    void dispatchWebhook(request.user.orgId, 'load.status_changed', loadWebhookPayload(load));
    return load;
  });

  app.patch('/loads/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateLoadStatusSchema.parse(request.body);
    const result = await fleetService.updateLoadStatus(
      request.user.orgId,
      id,
      body.status as LoadStatus,
      body.note
    );
    if ('error' in result) {
      return reply.status(result.error === 'not_found' ? 404 : 409).send({
        error: result.error === 'not_found' ? 'Tour nicht gefunden' : `Übergang ${result.from} → ${result.to} nicht erlaubt`,
      });
    }
    void dispatchWebhook(request.user.orgId, 'load.status_changed', loadWebhookPayload(result.load));
    return result.load;
  });

  app.post('/loads/:id/ping-driver', async (request, reply) => {
    const { id } = request.params as { id: string };
    const load = await prisma.load.findFirst({
      where: { id, orgId: request.user.orgId },
      include: { driver: true, organization: true },
    });
    if (!load) return reply.status(404).send({ error: 'Tour nicht gefunden' });
    if (!load.driver?.email) return reply.status(400).send({ error: 'Fahrer hat keine E-Mail' });
    if (load.lastDriverPing && Date.now() - load.lastDriverPing.getTime() < 30 * 60 * 1000) {
      return reply.status(429).send({ error: 'Fahrer wurde bereits erinnert' });
    }
    await sendEmail(buildDriverPingEmail(load as Parameters<typeof buildDriverPingEmail>[0]));
    await prisma.load.update({ where: { id }, data: { lastDriverPing: new Date() } });
    return { success: true };
  });

  app.get('/loads/:id/pod/:podId', async (request, reply) => {
    const { id, podId } = request.params as { id: string; podId: string };
    const pod = await prisma.podUpload.findFirst({
      where: { id: podId, load: { id, orgId: request.user.orgId } },
    });
    if (!pod) return reply.status(404).send({ error: 'Dokument nicht gefunden' });
    return reply
      .type(pod.mimeType)
      .header('X-Content-Type-Options', 'nosniff')
      .send(createReadStream(pod.filePath));
  });

  // --- CSV load import ---
  app.post('/loads/import', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'Keine Datei hochgeladen' });
    const buffer = await data.toBuffer();
    if (buffer.length > MAX_CSV_SIZE) return reply.status(400).send({ error: 'Datei zu groß (max. 5 MB)' });
    let rows: Record<string, string>[];
    try {
      rows = parse(buffer.toString('utf-8'), { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      return reply.status(400).send({ error: 'CSV konnte nicht gelesen werden' });
    }
    if (rows.length > 500) return reply.status(400).send({ error: 'Maximal 500 Zeilen pro Import' });
    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;
    for (let i = 0; i < rows.length; i++) {
      const parsed = LoadCsvRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push({ row: i + 2, message: parsed.error.issues[0]?.message ?? 'Ungültige Zeile' });
        continue;
      }
      const row = parsed.data;
      const pickupAt = new Date(row.pickupAt);
      const deliveryAt = new Date(row.deliveryAt);
      if (isNaN(pickupAt.getTime()) || isNaN(deliveryAt.getTime())) {
        errors.push({ row: i + 2, message: 'Ungültiges Datum' });
        continue;
      }
      const customer = await prisma.fleetCustomer.findFirst({
        where: { orgId: request.user.orgId, name: { equals: row.customerName, mode: 'insensitive' } },
      }) ?? await prisma.fleetCustomer.create({
        data: { orgId: request.user.orgId, name: row.customerName },
      });
      const created = await fleetService.createLoad(request.user.orgId, {
        loadNumber: row.loadNumber,
        customerId: customer.id,
        pickupAddress: row.pickupAddress,
        pickupAt: pickupAt.toISOString(),
        deliveryAddress: row.deliveryAddress,
        deliveryAt: deliveryAt.toISOString(),
        cargoDescription: row.cargoDescription,
        weightKg: row.weightKg,
        pallets: row.pallets,
        priceCents: row.price !== undefined ? Math.round(row.price * 100) : undefined,
      });
      if ('error' in created) {
        errors.push({ row: i + 2, message: 'Ungültige Referenz' });
        continue;
      }
      imported++;
    }
    return { imported, errors };
  });

  // --- Overview KPIs ---
  app.get('/fleet/overview', async (request) => {
    return fleetService.getFleetOverview(request.user.orgId);
  });

  // --- Invoices ---
  app.get('/invoices', async (request) => {
    return prisma.invoice.findMany({
      where: { orgId: request.user.orgId },
      include: { load: { select: { loadNumber: true, deliveryAddress: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  });

  app.post('/loads/:id/invoice', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = IssueInvoiceSchema.parse(request.body ?? {});
    const result = await invoiceService.issueInvoice(request.user.orgId, id, body);
    if ('error' in result && result.error) {
      const map: Record<string, [number, string]> = {
        not_found: [404, 'Tour nicht gefunden'],
        load_not_delivered: [409, 'Tour ist noch nicht geliefert'],
        already_invoiced: [409, 'Rechnung existiert bereits'],
        no_price: [400, 'Kein Preis angegeben'],
      };
      const [code, msg] = map[result.error] ?? [500, 'Fehler'];
      return reply.status(code).send({ error: msg });
    }
    if (!('invoice' in result)) return reply.status(500).send({ error: 'Fehler' });
    void dispatchWebhook(request.user.orgId, 'invoice.issued', {
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
      loadId: id,
      grossCents: result.invoice.grossCents,
    });
    return reply.status(201).send(result.invoice);
  });

  app.get('/invoices/:id/pdf', async (request, reply) => {
    const { id } = request.params as { id: string };
    const invoice = await prisma.invoice.findFirst({ where: { id, orgId: request.user.orgId } });
    if (!invoice?.pdfPath) return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    const safeName = invoice.invoiceNumber.replace(/[^A-Za-z0-9._-]/g, '_');
    return reply
      .type('application/pdf')
      .header('X-Content-Type-Options', 'nosniff')
      .header('Content-Disposition', `inline; filename="${safeName}.pdf"`)
      .send(createReadStream(invoice.pdfPath));
  });

  app.patch('/invoices/:id/paid', async (request, reply) => {
    const { id } = request.params as { id: string };
    const res = await prisma.invoice.updateMany({
      where: { id, orgId: request.user.orgId, status: 'ISSUED' },
      data: { status: 'PAID', paidAt: new Date() },
    });
    if (!res.count) return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    return prisma.invoice.findUnique({ where: { id } });
  });
}
