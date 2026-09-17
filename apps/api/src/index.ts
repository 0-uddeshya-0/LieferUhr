import Fastify from 'fastify';
import { ZodError } from 'zod';
import multipart from '@fastify/multipart';
import { registerCors } from './plugins/cors';
import { registerAuth } from './plugins/auth';
import { registerRateLimit } from './plugins/rateLimit';
import { authRoutes } from './routes/auth';
import { supplierRoutes } from './routes/suppliers';
import { orderRoutes } from './routes/orders';
import { supplierStatusRoutes } from './routes/supplier-status';
import { dashboardRoutes } from './routes/dashboard';
import { organizationRoutes } from './routes/organizations';
import { settingsRoutes } from './routes/settings';
import { teamRoutes } from './routes/team';
import { fleetRoutes } from './routes/fleet';
import { driverRoutes } from './routes/driver';
import { trackingRoutes } from './routes/tracking';
import { startReminderJob } from './jobs/reminderJob';
import { startDigestJob } from './jobs/digestJob';
import { startFleetJob } from './jobs/fleetJob';
import { config } from './config';
import { prisma } from './db';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : 'info',
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
  });

  app.setErrorHandler((error, request, reply) => {
    // instanceof can fail when the schema lives in a different module graph
    // (e.g. CJS dist of @lieferradar/shared vs. ESM test runner) — match on shape.
    if (error instanceof ZodError || error.name === 'ZodError') {
      const zodError = error as unknown as ZodError;
      return reply.status(400).send({
        error: 'Validierungsfehler',
        details: zodError.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    request.log.error(error);
    return reply.status(error.statusCode ?? 500).send({
      error: error.statusCode ? error.message : 'Interner Fehler',
    });
  });

  // Ops endpoints — no auth, used by the container healthcheck and uptime monitors.
  app.get('/healthz', async () => ({ status: 'ok' }));
  app.get('/readyz', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      return reply.status(503).send({ status: 'unavailable' });
    }
  });

  await registerCors(app);
  await registerAuth(app);
  await registerRateLimit(app);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  // All product routes live under /api so the production site can proxy them
  // on the same origin. Health endpoints above stay unprefixed.
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(supplierRoutes);
      await api.register(orderRoutes);
      await api.register(supplierStatusRoutes);
      await api.register(dashboardRoutes);
      await api.register(organizationRoutes);
      await api.register(settingsRoutes);
      await api.register(teamRoutes);
      await api.register(fleetRoutes);
      await api.register(driverRoutes);
      await api.register(trackingRoutes);
    },
    { prefix: '/api' },
  );

  if (config.NODE_ENV !== 'test') {
    startReminderJob(app.log);
    startDigestJob(app.log);
    startFleetJob(app.log);
  }

  return app;
}
