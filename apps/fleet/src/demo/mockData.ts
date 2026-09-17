import type {
  Driver, FleetCustomer, Invoice, Load, Vehicle,
} from '../types';

export const DEMO_USER = {
  user: { id: 'demo-user', email: 'dispo@spedition-berger.example', name: 'Sandra Berger' },
  organization: { id: 'demo-org', name: 'Spedition Berger GmbH' },
};

const inDays = (d: number, hour = 9) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export const DEMO_CUSTOMERS: FleetCustomer[] = [
  { id: 'c1', name: 'Möbelhaus Schmid GmbH', contactName: 'Peter Schmid', contactEmail: 'disposition@moebel-schmid.example', address: 'Hauptstraße 12, 74523 Schwäbisch Hall', notes: null, _count: { loads: 3 } },
  { id: 'c2', name: 'Getränke Fuchs OHG', contactName: 'Anna Fuchs', contactEmail: 'lager@getraenke-fuchs.example', address: 'Industriestraße 4, 74564 Crailsheim', notes: null, _count: { loads: 2 } },
  { id: 'c3', name: 'Bauzentrum Kern AG', contactName: null, contactEmail: 'einkauf@bauzentrum-kern.example', address: 'Am Güterbahnhof 8, 74613 Öhringen', notes: 'Rampe B, Anmeldung beim Warenlager', _count: { loads: 1 } },
];

export const DEMO_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Karl Wagner', phone: '+49 171 2345678', email: 'k.wagner@spedition-berger.example', licenseValidUntil: inDays(20), notes: null, _count: { loads: 4 } },
  { id: 'd2', name: 'Mehmet Yilmaz', phone: '+49 172 9876543', email: null, licenseValidUntil: inDays(340), notes: null, _count: { loads: 2 } },
];

export const DEMO_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'SHA-BG 123', type: '7,5t Koffer', nextInspectionAt: inDays(26), notes: null },
  { id: 'v2', plate: 'SHA-BG 456', type: 'Sprinter', nextInspectionAt: inDays(280), notes: null },
];

export const DEMO_LOADS: Load[] = [
  {
    id: 'l1', loadNumber: 'BG-1042', status: 'DISPATCHED', statusNote: null,
    customerId: 'c1', customer: DEMO_CUSTOMERS[0],
    driverId: 'd1', driver: DEMO_DRIVERS[0],
    vehicleId: 'v1', vehicle: DEMO_VEHICLES[0],
    pickupAddress: 'Möbelhaus Schmid, Hauptstraße 12, 74523 Schwäbisch Hall',
    pickupAt: inDays(0, 14),
    deliveryAddress: 'Bauzentrum Kern, Am Güterbahnhof 8, 74613 Öhringen',
    deliveryAt: inDays(0, 17),
    cargoDescription: '2 Paletten Gartenmöbel, verpackt',
    weightKg: 420, pallets: 2, priceCents: 34000, notes: null,
    driverToken: 'demo', trackingToken: 'demo',
    createdAt: ago(26), updatedAt: ago(2),
    pods: [], events: [
      { id: 'e1a', status: 'NEW', note: null, source: 'dispatcher', createdAt: ago(26) },
      { id: 'e1b', status: 'DISPATCHED', note: null, source: 'dispatcher', createdAt: ago(2) },
    ],
  },
  {
    id: 'l2', loadNumber: 'BG-1041', status: 'IN_TRANSIT', statusNote: null,
    customerId: 'c2', customer: DEMO_CUSTOMERS[1],
    driverId: 'd2', driver: DEMO_DRIVERS[1],
    vehicleId: 'v2', vehicle: DEMO_VEHICLES[1],
    pickupAddress: 'Getränke Fuchs, Industriestraße 4, 74564 Crailsheim',
    pickupAt: inDays(0, 8),
    deliveryAddress: 'Gasthof Linde, Marktplatz 3, 74549 Wolpertshausen',
    deliveryAt: inDays(0, 11),
    cargoDescription: '6 Paletten Getränke (glasfrei verpackt)',
    weightKg: 1180, pallets: 6, priceCents: 28500, notes: null,
    driverToken: 'demo-l1041-driver', trackingToken: 'demo-l1041-track',
    pickedUpAt: ago(2),
    createdAt: ago(30), updatedAt: ago(1),
    pods: [], events: [
      { id: 'e2a', status: 'NEW', note: null, source: 'dispatcher', createdAt: ago(30) },
      { id: 'e2b', status: 'DISPATCHED', note: null, source: 'dispatcher', createdAt: ago(20) },
      { id: 'e2c', status: 'PICKED_UP', note: null, source: 'driver', createdAt: ago(2) },
      { id: 'e2d', status: 'IN_TRANSIT', note: null, source: 'driver', createdAt: ago(1) },
    ],
  },
  {
    id: 'l3', loadNumber: 'BG-1040', status: 'NEW', statusNote: null,
    customerId: 'c3', customer: DEMO_CUSTOMERS[2],
    driverId: null, driver: null,
    vehicleId: null, vehicle: null,
    pickupAddress: 'Bauzentrum Kern, Am Güterbahnhof 8, 74613 Öhringen',
    pickupAt: inDays(1, 7),
    deliveryAddress: 'Wohnanlage Nord, Baustraße 21, 74523 Schwäbisch Hall',
    deliveryAt: inDays(1, 10),
    cargoDescription: 'Baustoffe: 10 Säcke Estrich, Kleber',
    weightKg: 350, pallets: 1, priceCents: 19500, notes: null,
    driverToken: 'demo-l1040-driver', trackingToken: 'demo-l1040-track',
    createdAt: ago(4), updatedAt: ago(4),
    pods: [], events: [
      { id: 'e3a', status: 'NEW', note: null, source: 'dispatcher', createdAt: ago(4) },
    ],
  },
  {
    id: 'l4', loadNumber: 'BG-1039', status: 'DELIVERED', statusNote: null,
    customerId: 'c1', customer: DEMO_CUSTOMERS[0],
    driverId: 'd1', driver: DEMO_DRIVERS[0],
    vehicleId: 'v1', vehicle: DEMO_VEHICLES[0],
    pickupAddress: 'Möbelhaus Schmid, Hauptstraße 12, 74523 Schwäbisch Hall',
    pickupAt: ago(30),
    deliveryAddress: 'Privat Haus Becher, Ringweg 5, 74564 Crailsheim',
    deliveryAt: ago(27),
    cargoDescription: 'Wohnzimmer-Schrankwand, 4 Pakete',
    weightKg: 210, pallets: 0, priceCents: 26000, notes: null,
    driverToken: 'demo-l1039-driver', trackingToken: 'demo-l1039-track',
    pickedUpAt: ago(29), deliveredAt: ago(27),
    createdAt: ago(50), updatedAt: ago(27),
    pods: [{ id: 'p1', fileName: 'pod.jpg', mimeType: 'image/jpeg', createdAt: ago(27), uploadedBy: 'driver' }],
    events: [
      { id: 'e4a', status: 'NEW', note: null, source: 'dispatcher', createdAt: ago(50) },
      { id: 'e4b', status: 'DISPATCHED', note: null, source: 'dispatcher', createdAt: ago(48) },
      { id: 'e4c', status: 'PICKED_UP', note: null, source: 'driver', createdAt: ago(29) },
      { id: 'e4d', status: 'DELIVERED', note: 'Empfangen durch Hausherr', source: 'driver', createdAt: ago(27) },
    ],
  },
  {
    id: 'l5', loadNumber: 'BG-1038', status: 'INVOICED', statusNote: null,
    customerId: 'c2', customer: DEMO_CUSTOMERS[1],
    driverId: 'd2', driver: DEMO_DRIVERS[1],
    vehicleId: 'v2', vehicle: DEMO_VEHICLES[1],
    pickupAddress: 'Getränke Fuchs, Industriestraße 4, 74564 Crailsheim',
    pickupAt: ago(96),
    deliveryAddress: 'Hotel Krone, Bahnhofstraße 9, 74613 Öhringen',
    deliveryAt: ago(94),
    cargoDescription: '8 Paletten Wasserkisten',
    weightKg: 1450, pallets: 8, priceCents: 31000, notes: null,
    driverToken: 'demo-l1038-driver', trackingToken: 'demo-l1038-track',
    pickedUpAt: ago(96), deliveredAt: ago(94),
    createdAt: ago(120), updatedAt: ago(90),
    pods: [{ id: 'p2', fileName: 'pod.jpg', mimeType: 'image/jpeg', createdAt: ago(94), uploadedBy: 'driver' }],
    events: [
      { id: 'e5a', status: 'DELIVERED', note: null, source: 'driver', createdAt: ago(94) },
      { id: 'e5b', status: 'INVOICED', note: null, source: 'dispatcher', createdAt: ago(90) },
    ],
  },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'FR-2026-001', buyerName: 'Getränke Fuchs OHG',
    netCents: 31000, taxRateBps: 1900, grossCents: 36890,
    status: 'ISSUED', issuedAt: ago(90), dueAt: inDays(10),
    loadId: 'l5', load: { loadNumber: 'BG-1038', deliveryAddress: 'Hotel Krone, Bahnhofstraße 9, 74613 Öhringen' },
  },
];

export const DEMO_BILLING = {
  street: 'Gewerbering 14',
  zip: '74523',
  city: 'Schwäbisch Hall',
  taxId: 'DE 123 456 789',
  invoicePrefix: 'BG',
};
