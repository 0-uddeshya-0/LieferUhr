import type { LoadStatus } from '@prisma/client';
import { prisma } from '../db';
import type { CreateLoadInput } from '@lieferradar/shared';

const loadInclude = {
  customer: true,
  driver: true,
  vehicle: true,
  pods: { orderBy: { createdAt: 'desc' as const } },
  invoice: true,
};

export async function listLoads(
  orgId: string,
  filters: {
    status?: LoadStatus;
    driverId?: string;
    customerId?: string;
    unassignedOnly?: boolean;
    search?: string;
  }
) {
  return prisma.load.findMany({
    where: {
      orgId,
      status: filters.status,
      driverId: filters.driverId,
      customerId: filters.customerId,
      ...(filters.unassignedOnly ? { driverId: null } : {}),
      ...(filters.search
        ? {
            OR: [
              { loadNumber: { contains: filters.search, mode: 'insensitive' } },
              { cargoDescription: { contains: filters.search, mode: 'insensitive' } },
              { pickupAddress: { contains: filters.search, mode: 'insensitive' } },
              { deliveryAddress: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: loadInclude,
    orderBy: [{ pickupAt: 'asc' }],
  });
}

export async function getLoadById(orgId: string, id: string) {
  return prisma.load.findFirst({
    where: { id, orgId },
    include: {
      ...loadInclude,
      events: { orderBy: { createdAt: 'desc' } },
    },
  });
}

/**
 * Every referenced entity must belong to the caller's org — otherwise a
 * dispatcher could attach a foreign driver/customer and leak load details
 * (e.g. via the dispatch email) across tenants.
 */
async function refsBelongToOrg(
  orgId: string,
  refs: { customerId?: string | null; driverId?: string | null; vehicleId?: string | null }
): Promise<boolean> {
  const [customers, drivers, vehicles] = await Promise.all([
    refs.customerId ? prisma.fleetCustomer.count({ where: { id: refs.customerId, orgId } }) : 1,
    refs.driverId ? prisma.driver.count({ where: { id: refs.driverId, orgId } }) : 1,
    refs.vehicleId ? prisma.vehicle.count({ where: { id: refs.vehicleId, orgId } }) : 1,
  ]);
  return customers > 0 && drivers > 0 && vehicles > 0;
}

export async function createLoad(orgId: string, input: CreateLoadInput) {
  if (!(await refsBelongToOrg(orgId, input))) {
    return { error: 'invalid_ref' as const };
  }
  const data = {
    ...input,
    pickupAt: new Date(input.pickupAt),
    pickupUntil: input.pickupUntil ? new Date(input.pickupUntil) : undefined,
    deliveryAt: new Date(input.deliveryAt),
    deliveryUntil: input.deliveryUntil ? new Date(input.deliveryUntil) : undefined,
    driverId: input.driverId || null,
    vehicleId: input.vehicleId || null,
  };

  const status: LoadStatus = data.driverId ? 'DISPATCHED' : 'NEW';

  const load = await prisma.load.create({
    data: {
      ...data,
      orgId,
      status,
      events: {
        create: { status, note: 'Auftrag angelegt', source: 'dispatcher' },
      },
    },
    include: loadInclude,
  });
  return load;
}

export async function updateLoad(orgId: string, id: string, input: Partial<CreateLoadInput>) {
  const load = await prisma.load.findFirst({ where: { id, orgId } });
  if (!load) return { error: 'not_found' as const };
  if (!(await refsBelongToOrg(orgId, { customerId: input.customerId }))) {
    return { error: 'invalid_ref' as const };
  }
  const data: Record<string, unknown> = { ...input };
  delete data.driverId;
  delete data.vehicleId;
  for (const key of ['pickupAt', 'pickupUntil', 'deliveryAt', 'deliveryUntil'] as const) {
    if (input[key]) data[key] = new Date(input[key]!);
  }
  return prisma.load.update({ where: { id }, data, include: loadInclude });
}

export async function assignLoad(
  orgId: string,
  id: string,
  driverId: string | null,
  vehicleId: string | null
) {
  const load = await prisma.load.findFirst({ where: { id, orgId } });
  if (!load) return { error: 'not_found' as const };
  if (!(await refsBelongToOrg(orgId, { driverId, vehicleId }))) {
    return { error: 'invalid_ref' as const };
  }

  const data: Record<string, unknown> = { driverId, vehicleId };
  let eventStatus: LoadStatus | null = null;

  if (driverId && load.status === 'NEW') {
    data.status = 'DISPATCHED';
    eventStatus = 'DISPATCHED';
  } else if (!driverId && load.status === 'DISPATCHED') {
    data.status = 'NEW';
    eventStatus = 'NEW';
  }

  return prisma.load.update({
    where: { id },
    data: {
      ...data,
      ...(eventStatus
        ? { events: { create: { status: eventStatus, source: 'dispatcher' } } }
        : {}),
    },
    include: loadInclude,
  });
}

const ALLOWED_DISPATCHER_TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  NEW: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['PICKED_UP', 'CANCELLED', 'NEW'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['INVOICED'],
  INVOICED: [],
  CANCELLED: ['NEW'],
};

export function canTransition(from: LoadStatus, to: LoadStatus): boolean {
  return ALLOWED_DISPATCHER_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateLoadStatus(
  orgId: string,
  id: string,
  status: LoadStatus,
  note?: string,
  source: 'dispatcher' | 'driver' = 'dispatcher'
) {
  const load = await prisma.load.findFirst({ where: { id, orgId } });
  if (!load) return { error: 'not_found' as const };
  if (!canTransition(load.status, status)) {
    return { error: 'invalid_transition' as const, from: load.status, to: status };
  }

  const data: Record<string, unknown> = {
    status,
    statusNote: note ?? load.statusNote,
    events: { create: { status, note, source } },
  };
  if (status === 'PICKED_UP') data.pickedUpAt = new Date();
  if (status === 'DELIVERED') data.deliveredAt = new Date();
  if (source === 'driver') data.lastDriverUpdate = new Date();

  const updated = await prisma.load.update({
    where: { id },
    data,
    include: loadInclude,
  });
  return { load: updated };
}

export async function getFleetOverview(orgId: string) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [todayLoads, unassigned, inTransit, deliveredWeek, expiringDrivers, expiringVehicles] =
    await Promise.all([
      prisma.load.count({
        where: { orgId, pickupAt: { gte: startOfDay, lte: endOfDay }, status: { not: 'CANCELLED' } },
      }),
      prisma.load.count({ where: { orgId, status: 'NEW' } }),
      prisma.load.count({ where: { orgId, status: { in: ['PICKED_UP', 'IN_TRANSIT'] } } }),
      prisma.load.aggregate({
        where: { orgId, deliveredAt: { gte: weekAgo } },
        _sum: { priceCents: true },
        _count: true,
      }),
      prisma.driver.findMany({
        where: { orgId, licenseValidUntil: { lte: in30Days } },
        select: { id: true, name: true, licenseValidUntil: true },
      }),
      prisma.vehicle.findMany({
        where: { orgId, nextInspectionAt: { lte: in30Days } },
        select: { id: true, plate: true, nextInspectionAt: true },
      }),
    ]);

  const pendingPods = await prisma.load.count({
    where: { orgId, status: 'DELIVERED', pods: { none: {} } },
  });

  return {
    todayLoads,
    unassigned,
    inTransit,
    deliveredThisWeek: deliveredWeek._count,
    revenueThisWeekCents: deliveredWeek._sum.priceCents ?? 0,
    pendingPods,
    expiringDrivers,
    expiringVehicles,
  };
}
