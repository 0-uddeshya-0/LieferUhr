import type { FastifyInstance } from 'fastify';
import { mkdirSync } from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { DriverStatusUpdateSchema, DRIVER_TRANSITIONS } from '@lieferradar/shared';
import type { LoadStatus } from '@prisma/client';
import { prisma } from '../db';
import { config } from '../config';
import { buildDriverStatusAlert, sendEmail } from '../services/emailService';
import { dispatchWebhook, loadWebhookPayload } from '../services/webhookService';

const ALLOWED_POD_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'application/pdf'];

function driverView(load: {
  loadNumber: string;
  status: LoadStatus;
  pickupAddress: string;
  pickupAt: Date;
  pickupUntil: Date | null;
  deliveryAddress: string;
  deliveryAt: Date;
  deliveryUntil: Date | null;
  cargoDescription: string;
  weightKg: number | null;
  pallets: number | null;
  statusNote: string | null;
  vehicle: { plate: string } | null;
  organization: { name: string };
  pods: Array<{ id: string }>;
}) {
  return {
    loadNumber: load.loadNumber,
    status: load.status,
    pickupAddress: load.pickupAddress,
    pickupAt: load.pickupAt.toISOString(),
    pickupUntil: load.pickupUntil?.toISOString(),
    deliveryAddress: load.deliveryAddress,
    deliveryAt: load.deliveryAt.toISOString(),
    deliveryUntil: load.deliveryUntil?.toISOString(),
    cargoDescription: load.cargoDescription,
    weightKg: load.weightKg ?? undefined,
    pallets: load.pallets ?? undefined,
    statusNote: load.statusNote ?? undefined,
    vehiclePlate: load.vehicle?.plate,
    carrierName: load.organization.name,
    podCount: load.pods.length,
    allowedTransitions: DRIVER_TRANSITIONS[load.status] ?? [],
  };
}

export async function driverRoutes(app: FastifyInstance) {
  app.get('/t/:token', {
    config: { rateLimit: { max: 60, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const load = await prisma.load.findUnique({
      where: { driverToken: token },
      include: { vehicle: true, organization: true, pods: { select: { id: true } } },
    });
    if (!load) return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });
    return driverView(load);
  });

  app.post('/t/:token/status', {
    config: { rateLimit: { max: 20, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = DriverStatusUpdateSchema.parse(request.body);

    const load = await prisma.load.findUnique({
      where: { driverToken: token },
      include: { driver: true, customer: true, organization: true, pods: true },
    });
    if (!load) return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });
    if (!(DRIVER_TRANSITIONS[load.status] ?? []).includes(body.status)) {
      return reply.status(409).send({ error: `Übergang ${load.status} → ${body.status} nicht erlaubt` });
    }

    const updated = await prisma.load.update({
      where: { id: load.id },
      data: {
        status: body.status,
        statusNote: body.note,
        lastDriverUpdate: new Date(),
        pickedUpAt: body.status === 'PICKED_UP' ? new Date() : undefined,
        deliveredAt: body.status === 'DELIVERED' ? new Date() : undefined,
        events: { create: { status: body.status, note: body.note, source: 'driver' } },
      },
      include: { vehicle: true, organization: true, pods: true, customer: true },
    });

    void sendEmail(buildDriverStatusAlert(load, body.status, body.note)).catch(() => {});
    void dispatchWebhook(load.orgId, 'load.driver_responded', loadWebhookPayload(updated));
    request.log.info({ loadId: load.id, status: body.status }, 'Driver status updated');
    return { success: true, status: body.status };
  });

  app.post('/t/:token/pod', {
    config: { rateLimit: { max: 20, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const load = await prisma.load.findUnique({ where: { driverToken: token } });
    if (!load) return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });

    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'Keine Datei hochgeladen' });
    if (!ALLOWED_POD_TYPES.includes(file.mimetype)) {
      return reply.status(400).send({ error: 'Nur Bilder (JPG/PNG/HEIC/WebP) oder PDF erlaubt' });
    }

    const dir = path.join(config.UPLOAD_DIR, load.orgId, 'pods');
    mkdirSync(dir, { recursive: true });
    const ext = file.mimetype === 'application/pdf' ? '.pdf' : `.${file.mimetype.split('/')[1]}`;
    // loadNumber is free text — strip path/header-unsafe chars before it
    // becomes part of a filename (and later a Content-Disposition value).
    const safeNumber = load.loadNumber.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 60);
    const fileName = `pod-${safeNumber}-${randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(dir, fileName);
    await pipeline(file.file, createWriteStream(filePath));
    if (file.file.truncated) {
      const { unlinkSync } = await import('fs');
      unlinkSync(filePath);
      return reply.status(400).send({ error: 'Datei zu groß (max. 5 MB)' });
    }

    const pod = await prisma.podUpload.create({
      data: { loadId: load.id, fileName, filePath, mimeType: file.mimetype, uploadedBy: 'driver' },
    });
    await prisma.load.update({
      where: { id: load.id },
      data: {
        lastDriverUpdate: new Date(),
        events: { create: { status: load.status, note: 'Abliefernachweis hochgeladen', source: 'driver' } },
      },
    });
    request.log.info({ loadId: load.id, podId: pod.id }, 'POD uploaded');
    return reply.status(201).send({ id: pod.id });
  });
}
