import cron from 'node-cron';
import { subHours, subMinutes } from 'date-fns';
import { prisma } from '../db';
import { config } from '../config';
import { buildDriverPingEmail, sendEmail } from '../services/emailService';

/**
 * Pings drivers on dispatched loads whose pickup window has started
 * without a pickup confirmation. At most one ping per 2 hours per load.
 */
export async function processDriverPings(): Promise<number> {
  const stale = await prisma.load.findMany({
    where: {
      status: 'DISPATCHED',
      pickupAt: { lt: subMinutes(new Date(), 30) },
      driver: { email: { not: null } },
      OR: [{ lastDriverPing: null }, { lastDriverPing: { lt: subHours(new Date(), 2) } }],
    },
    include: { driver: true, organization: true },
    take: 50,
  });

  let sent = 0;
  for (const load of stale) {
    try {
      await sendEmail(buildDriverPingEmail(load as Parameters<typeof buildDriverPingEmail>[0]));
      await prisma.load.update({ where: { id: load.id }, data: { lastDriverPing: new Date() } });
      sent++;
    } catch {
      // per-load failure must not stop the sweep
    }
  }
  return sent;
}

export function startFleetJob(logger: { info: (obj: object, msg: string) => void }) {
  cron.schedule(config.FLEET_PING_CRON, async () => {
    try {
      const count = await processDriverPings();
      if (count > 0) logger.info({ count }, 'Fleet ping job completed');
    } catch (err) {
      logger.info({ err }, 'Fleet ping job failed');
    }
  });
}
