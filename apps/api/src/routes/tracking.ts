import type { FastifyInstance } from 'fastify';
import { createReadStream } from 'fs';
import { prisma } from '../db';
import { LOAD_STATUS_LABELS_DE } from '@lieferradar/shared';

export async function trackingRoutes(app: FastifyInstance) {
  app.get('/l/:token', {
    config: { rateLimit: { max: 60, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const load = await prisma.load.findUnique({
      where: { trackingToken: token },
      include: {
        customer: { select: { name: true } },
        organization: { select: { name: true } },
        pods: { select: { id: true } },
        events: { orderBy: { createdAt: 'desc' }, select: { status: true, createdAt: true } },
      },
    });
    if (!load) return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });

    return {
      loadNumber: load.loadNumber,
      status: load.status,
      statusLabel: LOAD_STATUS_LABELS_DE[load.status],
      carrierName: load.organization.name,
      cargoDescription: load.cargoDescription,
      deliveryAddress: load.deliveryAddress,
      deliveryAt: load.deliveryAt.toISOString(),
      deliveryUntil: load.deliveryUntil?.toISOString(),
      deliveredAt: load.deliveredAt?.toISOString(),
      podAvailable: load.pods.length > 0,
      events: load.events.map((e) => ({
        status: e.status,
        statusLabel: LOAD_STATUS_LABELS_DE[e.status],
        at: e.createdAt.toISOString(),
      })),
    };
  });

  app.get('/l/:token/pod', {
    config: { rateLimit: { max: 30, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const load = await prisma.load.findUnique({
      where: { trackingToken: token },
      include: { pods: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    const pod = load?.pods[0];
    if (!load || !pod) return reply.status(404).send({ error: 'Kein Abliefernachweis vorhanden' });
    return reply
      .type(pod.mimeType)
      .header('X-Content-Type-Options', 'nosniff')
      .header('Content-Disposition', `attachment; filename="${pod.fileName}"`)
      .send(createReadStream(pod.filePath));
  });
}
