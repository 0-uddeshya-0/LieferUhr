import {
  DEMO_BILLING, DEMO_CUSTOMERS, DEMO_DRIVERS, DEMO_INVOICES, DEMO_LOADS, DEMO_VEHICLES,
} from './mockData';
import type {
  Driver, DriverLoadView, FleetCustomer, FleetOverview, Invoice, Load, LoadStatus,
  TrackingView, Vehicle,
} from '../types';
import { DEMO_DRIVER_TOKEN, DEMO_TRACK_TOKEN } from './config';

// In-memory state so the Pages demo behaves like the real app until reload.
let loads: Load[] = DEMO_LOADS.map((l) => ({ ...l, events: [...(l.events ?? [])], pods: [...l.pods] }));
let customers: FleetCustomer[] = [...DEMO_CUSTOMERS];
let drivers: Driver[] = [...DEMO_DRIVERS];
let vehicles: Vehicle[] = [...DEMO_VEHICLES];
let invoices: Invoice[] = [...DEMO_INVOICES];
let billing = { ...DEMO_BILLING };
let idCounter = 0;

const nextId = (p: string) => `${p}-demo-${++idCounter}`;
const CLOSED: LoadStatus[] = ['DELIVERED', 'INVOICED', 'CANCELLED'];
const DRIVER_NEXT: Partial<Record<LoadStatus, LoadStatus[]>> = {
  DISPATCHED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED'],
  IN_TRANSIT: ['DELIVERED'],
};
const DISPATCHER_NEXT: Partial<Record<LoadStatus, LoadStatus[]>> = {
  NEW: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
};

const STATUS_LABEL_DE: Record<LoadStatus, string> = {
  NEW: 'Neu',
  DISPATCHED: 'Disponiert',
  PICKED_UP: 'Abgeholt',
  IN_TRANSIT: 'Unterwegs',
  DELIVERED: 'Geliefert',
  INVOICED: 'Berechnet',
  CANCELLED: 'Storniert',
};

function recordEvent(load: Load, status: LoadStatus, source: string, note?: string | null): Load {
  const now = new Date().toISOString();
  const next: Load = {
    ...load,
    status,
    statusNote: note ?? load.statusNote,
    updatedAt: now,
    events: [
      ...(load.events ?? []),
      { id: nextId('ev'), status, note: note ?? null, source, createdAt: now },
    ],
  };
  if (status === 'PICKED_UP') next.pickedUpAt = now;
  if (status === 'DELIVERED') next.deliveredAt = now;
  return next;
}

function applyStatus(id: string, status: LoadStatus, source: string, note?: string): Load | undefined {
  const load = loads.find((l) => l.id === id || l.driverToken === id || l.trackingToken === id);
  if (!load) return undefined;
  const allowed = source === 'driver' ? DRIVER_NEXT[load.status] : DISPATCHER_NEXT[load.status];
  if (!allowed?.includes(status)) return undefined;
  const updated = recordEvent(load, status, source, note);
  loads = loads.map((l) => (l.id === load.id ? updated : l));
  return updated;
}

function attach(load: Load): Load {
  return {
    ...load,
    customer: customers.find((c) => c.id === load.customerId) ?? load.customer,
    driver: drivers.find((d) => d.id === load.driverId) ?? null,
    vehicle: vehicles.find((v) => v.id === load.vehicleId) ?? null,
    invoice: invoices.find((i) => i.loadId === load.id) ?? null,
  };
}

function toDriverView(load: Load): DriverLoadView {
  return {
    loadNumber: load.loadNumber,
    status: load.status,
    pickupAddress: load.pickupAddress,
    pickupAt: load.pickupAt,
    pickupUntil: load.pickupUntil ?? undefined,
    deliveryAddress: load.deliveryAddress,
    deliveryAt: load.deliveryAt,
    deliveryUntil: load.deliveryUntil ?? undefined,
    cargoDescription: load.cargoDescription,
    weightKg: load.weightKg ?? undefined,
    pallets: load.pallets ?? undefined,
    statusNote: load.statusNote ?? undefined,
    vehiclePlate: load.vehicle?.plate ?? undefined,
    carrierName: 'Spedition Berger GmbH',
    podCount: load.pods.length,
    allowedTransitions: DRIVER_NEXT[load.status] ?? [],
  };
}

function toTrackingView(load: Load): TrackingView {
  return {
    loadNumber: load.loadNumber,
    status: load.status,
    statusLabel: STATUS_LABEL_DE[load.status],
    carrierName: 'Spedition Berger GmbH',
    cargoDescription: load.cargoDescription,
    deliveryAddress: load.deliveryAddress,
    deliveryAt: load.deliveryAt,
    deliveryUntil: load.deliveryUntil ?? undefined,
    deliveredAt: load.deliveredAt ?? undefined,
    podAvailable: load.pods.length > 0,
    events: (load.events ?? [])
      .filter((e) => e.status !== 'NEW')
      .map((e) => ({ status: e.status, statusLabel: STATUS_LABEL_DE[e.status], at: e.createdAt })),
  };
}

export const demoFleetApi = {
  overview: async (): Promise<FleetOverview> => {
    const today = new Date().toDateString();
    return {
      todayLoads: loads.filter((l) => new Date(l.pickupAt).toDateString() === today).length,
      unassigned: loads.filter((l) => !l.driverId && !CLOSED.includes(l.status)).length,
      inTransit: loads.filter((l) => ['PICKED_UP', 'IN_TRANSIT'].includes(l.status)).length,
      deliveredThisWeek: loads.filter((l) => l.deliveredAt).length,
      revenueThisWeekCents: invoices.reduce((s, i) => s + i.netCents, 0),
      pendingPods: loads.filter((l) => l.status === 'DELIVERED' && l.pods.length === 0).length,
      expiringDrivers: drivers
        .filter((d) => d.licenseValidUntil && new Date(d.licenseValidUntil).getTime() - Date.now() < 30 * 86_400_000)
        .map((d) => ({ id: d.id, name: d.name, licenseValidUntil: d.licenseValidUntil! })),
      expiringVehicles: vehicles
        .filter((v) => v.nextInspectionAt && new Date(v.nextInspectionAt).getTime() - Date.now() < 30 * 86_400_000)
        .map((v) => ({ id: v.id, plate: v.plate, nextInspectionAt: v.nextInspectionAt! })),
    };
  },

  customers: async () => customers,
  createCustomer: async (body: Partial<FleetCustomer>) => {
    const c: FleetCustomer = { id: nextId('c'), name: body.name ?? 'Neuer Kunde', ...body, _count: { loads: 0 } };
    customers = [...customers, c];
    return c;
  },
  updateCustomer: async (id: string, body: Partial<FleetCustomer>) => {
    customers = customers.map((c) => (c.id === id ? { ...c, ...body } : c));
    return customers.find((c) => c.id === id)!;
  },
  deleteCustomer: async (id: string) => { customers = customers.filter((c) => c.id !== id); },
  importCustomers: async () => ({ imported: 0, errors: [] }),

  drivers: async () => drivers,
  createDriver: async (body: Partial<Driver>) => {
    const d: Driver = { id: nextId('d'), name: body.name ?? 'Neuer Fahrer', ...body, _count: { loads: 0 } };
    drivers = [...drivers, d];
    return d;
  },
  updateDriver: async (id: string, body: Partial<Driver>) => {
    drivers = drivers.map((d) => (d.id === id ? { ...d, ...body } : d));
    return drivers.find((d) => d.id === id)!;
  },
  deleteDriver: async (id: string) => { drivers = drivers.filter((d) => d.id !== id); },

  vehicles: async () => vehicles,
  createVehicle: async (body: Partial<Vehicle>) => {
    const v: Vehicle = { id: nextId('v'), plate: body.plate ?? 'XX-YY 000', ...body };
    vehicles = [...vehicles, v];
    return v;
  },
  updateVehicle: async (id: string, body: Partial<Vehicle>) => {
    vehicles = vehicles.map((v) => (v.id === id ? { ...v, ...body } : v));
    return vehicles.find((v) => v.id === id)!;
  },
  deleteVehicle: async (id: string) => { vehicles = vehicles.filter((v) => v.id !== id); },

  loads: async (params?: Record<string, string>) => {
    let result = loads.map(attach);
    if (params?.status) result = result.filter((l) => l.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.loadNumber.toLowerCase().includes(q) ||
          l.customer.name.toLowerCase().includes(q) ||
          l.pickupAddress.toLowerCase().includes(q) ||
          l.deliveryAddress.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(a.pickupAt).getTime() - new Date(b.pickupAt).getTime());
  },
  load: async (id: string) => {
    const l = loads.find((x) => x.id === id);
    if (!l) throw new Error('Not found');
    return attach(l);
  },
  createLoad: async (body: Record<string, unknown>) => {
    const customer = customers.find((c) => c.id === body.customerId) ?? customers[0];
    const load: Load = {
      id: nextId('l'),
      loadNumber: String(body.loadNumber ?? `BG-${1043 + idCounter}`),
      status: 'NEW',
      customerId: customer.id,
      customer,
      pickupAddress: String(body.pickupAddress ?? ''),
      pickupAt: String(body.pickupAt ?? new Date().toISOString()),
      deliveryAddress: String(body.deliveryAddress ?? ''),
      deliveryAt: String(body.deliveryAt ?? new Date().toISOString()),
      cargoDescription: String(body.cargoDescription ?? ''),
      weightKg: body.weightKg as number | undefined,
      pallets: body.pallets as number | undefined,
      priceCents: body.priceCents as number | undefined,
      driverToken: nextId('dt'),
      trackingToken: nextId('tt'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pods: [],
      events: [{ id: nextId('ev'), status: 'NEW', note: null, source: 'dispatcher', createdAt: new Date().toISOString() }],
    };
    loads = [load, ...loads];
    return attach(load);
  },
  updateLoad: async (id: string, body: Record<string, unknown>) => {
    loads = loads.map((l) => (l.id === id ? { ...l, ...body, updatedAt: new Date().toISOString() } : l));
    return attach(loads.find((l) => l.id === id)!);
  },
  assignLoad: async (id: string, body: { driverId?: string | null; vehicleId?: string | null }) => {
    const load = loads.find((l) => l.id === id);
    if (!load) throw new Error('Not found');
    const updated: Load = {
      ...load,
      driverId: body.driverId ?? null,
      vehicleId: body.vehicleId ?? null,
      updatedAt: new Date().toISOString(),
    };
    if (updated.status === 'NEW' && updated.driverId) {
      loads = loads.map((l) => (l.id === id ? recordEvent(updated, 'DISPATCHED', 'dispatcher') : l));
    } else {
      loads = loads.map((l) => (l.id === id ? updated : l));
    }
    return attach(loads.find((l) => l.id === id)!);
  },
  setLoadStatus: async (id: string, status: LoadStatus, note?: string) => {
    const updated = applyStatus(id, status, 'dispatcher', note);
    if (!updated) throw new Error('Invalid transition');
    return attach(updated);
  },
  pingDriver: async () => ({ sent: true }),
  importLoads: async () => ({ imported: 0, errors: [] }),

  invoices: async () =>
    invoices.map((i) => ({
      ...i,
      load: loads.find((l) => l.id === i.loadId)
        ? { loadNumber: loads.find((l) => l.id === i.loadId)!.loadNumber, deliveryAddress: loads.find((l) => l.id === i.loadId)!.deliveryAddress }
        : i.load,
    })),
  issueInvoice: async (loadId: string, body: { netCents?: number; taxRateBps?: number; dueDays?: number }) => {
    const load = loads.find((l) => l.id === loadId);
    if (!load) throw new Error('Not found');
    const net = body.netCents ?? load.priceCents ?? 0;
    const tax = body.taxRateBps ?? 1900;
    const invoice: Invoice = {
      id: nextId('inv'),
      invoiceNumber: `${billing.invoicePrefix}-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      buyerName: load.customer.name,
      netCents: net,
      taxRateBps: tax,
      grossCents: Math.round(net * (1 + tax / 10000)),
      status: 'ISSUED',
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + (body.dueDays ?? 14) * 86_400_000).toISOString(),
      loadId,
      load: { loadNumber: load.loadNumber, deliveryAddress: load.deliveryAddress },
    };
    invoices = [...invoices, invoice];
    loads = loads.map((l) => (l.id === loadId ? { ...recordEvent(l, 'INVOICED', 'dispatcher'), invoice } : l));
    return invoice;
  },
  markPaid: async (id: string) => {
    invoices = invoices.map((i) => (i.id === id ? { ...i, status: 'PAID' as const, paidAt: new Date().toISOString() } : i));
    return invoices.find((i) => i.id === id)!;
  },
  invoicePdfUrl: () => 'javascript:void(0)',
  podUrl: () => 'javascript:void(0)',

  billingSettings: async () => billing,
  saveBillingSettings: async (body: Record<string, string>) => {
    billing = { ...billing, ...body };
    return billing;
  },
};

export const demoPublicApi = {
  driverLoad: async (token: string): Promise<DriverLoadView> => {
    const load = loads.find((l) => l.driverToken === token || (token === DEMO_DRIVER_TOKEN && l.id === 'l1'));
    if (!load) throw new Error('Not found');
    return toDriverView(attach(load));
  },
  driverSetStatus: async (token: string, status: LoadStatus, note?: string) => {
    const load = loads.find((l) => l.driverToken === token || (token === DEMO_DRIVER_TOKEN && l.id === 'l1'));
    if (!load) throw new Error('Not found');
    const updated = applyStatus(load.id, status, 'driver', note);
    if (!updated) throw new Error('Invalid transition');
    return { ok: true };
  },
  driverUploadPod: async (token: string) => {
    const load = loads.find((l) => l.driverToken === token || (token === DEMO_DRIVER_TOKEN && l.id === 'l1'));
    if (!load) throw new Error('Not found');
    const pod = { id: nextId('pod'), fileName: 'pod.jpg', mimeType: 'image/jpeg', createdAt: new Date().toISOString(), uploadedBy: 'driver' };
    loads = loads.map((l) => (l.id === load.id ? { ...l, pods: [...l.pods, pod] } : l));
    return { id: pod.id };
  },
  track: async (token: string): Promise<TrackingView> => {
    const load = loads.find((l) => l.trackingToken === token || (token === DEMO_TRACK_TOKEN && l.id === 'l1'));
    if (!load) throw new Error('Not found');
    return toTrackingView(attach(load));
  },
  trackPodUrl: () => 'javascript:void(0)',
};
