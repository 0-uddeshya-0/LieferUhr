export type LoadStatus =
  | 'NEW' | 'DISPATCHED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'INVOICED' | 'CANCELLED';

export interface FleetCustomer {
  id: string;
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  _count?: { loads: number };
}

export interface Driver {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  licenseValidUntil?: string | null;
  notes?: string | null;
  _count?: { loads: number };
}

export interface Vehicle {
  id: string;
  plate: string;
  type?: string | null;
  nextInspectionAt?: string | null;
  notes?: string | null;
}

export interface Pod {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
  uploadedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  netCents: number;
  taxRateBps: number;
  grossCents: number;
  status: 'ISSUED' | 'PAID';
  issuedAt: string;
  dueAt?: string | null;
  paidAt?: string | null;
  loadId: string;
  load?: { loadNumber: string; deliveryAddress: string };
}

export interface LoadEvent {
  id: string;
  status: LoadStatus;
  note?: string | null;
  source: string;
  createdAt: string;
}

export interface Load {
  id: string;
  loadNumber: string;
  status: LoadStatus;
  statusNote?: string | null;
  customerId: string;
  customer: FleetCustomer;
  driverId?: string | null;
  driver?: Driver | null;
  vehicleId?: string | null;
  vehicle?: Vehicle | null;
  pickupAddress: string;
  pickupAt: string;
  pickupUntil?: string | null;
  deliveryAddress: string;
  deliveryAt: string;
  deliveryUntil?: string | null;
  cargoDescription: string;
  weightKg?: number | null;
  pallets?: number | null;
  priceCents?: number | null;
  notes?: string | null;
  driverToken: string;
  trackingToken: string;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  lastDriverUpdate?: string | null;
  createdAt: string;
  updatedAt: string;
  pods: Pod[];
  invoice?: Invoice | null;
  events?: LoadEvent[];
}

export interface FleetOverview {
  todayLoads: number;
  unassigned: number;
  inTransit: number;
  deliveredThisWeek: number;
  revenueThisWeekCents: number;
  pendingPods: number;
  expiringDrivers: Array<{ id: string; name: string; licenseValidUntil: string }>;
  expiringVehicles: Array<{ id: string; plate: string; nextInspectionAt: string }>;
}

export interface DriverLoadView {
  loadNumber: string;
  status: LoadStatus;
  pickupAddress: string;
  pickupAt: string;
  pickupUntil?: string;
  deliveryAddress: string;
  deliveryAt: string;
  deliveryUntil?: string;
  cargoDescription: string;
  weightKg?: number;
  pallets?: number;
  statusNote?: string;
  vehiclePlate?: string;
  carrierName: string;
  podCount: number;
  allowedTransitions: LoadStatus[];
}

export interface TrackingView {
  loadNumber: string;
  status: LoadStatus;
  statusLabel: string;
  carrierName: string;
  cargoDescription: string;
  deliveryAddress: string;
  deliveryAt: string;
  deliveryUntil?: string;
  deliveredAt?: string;
  podAvailable: boolean;
  events: Array<{ status: LoadStatus; statusLabel: string; at: string }>;
}
