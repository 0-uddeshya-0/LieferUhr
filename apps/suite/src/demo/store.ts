import { useSyncExternalStore } from 'react';

// ————— Types —————

export type OfferStatus = 'new' | 'countered' | 'won' | 'lost';
export interface Offer {
  id: string;
  broker: string;
  from: string;
  to: string;
  cargo: string;
  rateCents: number;
  pickup: string;
  status: OfferStatus;
  counterCents?: number;
  handedOff?: boolean;
}

export type DocKind = 'license' | 'hu' | 'tacho' | 'adr' | 'module';
export interface ComplyDoc {
  kind: DocKind;
  holder: string; // driver or vehicle plate
  daysLeft: number; // negative = overdue
}
export interface DriverClock {
  id: string;
  name: string;
  driveTodayMin: number; // of 540 (9h)
  breakDueMin: number;   // minutes until 45min break required
  weekMin: number;       // of 3360 (56h)
}

export type HvacChannel = 'call' | 'mail' | 'form';
export type HvacUrgency = 'low' | 'high' | 'crit';
export interface HvacRequest {
  id: string;
  channel: HvacChannel;
  customer: string;
  body: string; // raw request text — extracted fields derive from this
  summary: string;
  device: string;
  address: string;
  urgency: HvacUrgency;
  suggestedTech: string;
  suggestedSlot: string;
  scheduled?: { tech: string; slot: string };
}
export interface HvacTech {
  id: string;
  name: string;
  skills: string;
}

export interface DepotMail {
  id: string;
  from: string;
  subject: string;
  body: string; // raw mail text — the extraction engine parses this, live
  status: 'new' | 'ordered';
}
export interface StockItem {
  sku: string;
  name: string;
  qty: number;
  reorderAt: number;
}
export interface DepotOrder {
  id: string;
  from: string;
  lines: { sku: string; qty: number }[];
  status: 'draft' | 'picking' | 'shipped';
}

interface SuiteState {
  offers: Offer[];
  drivers: DriverClock[];
  complyDocs: ComplyDoc[];
  hvacRequests: HvacRequest[];
  hvacTechs: HvacTech[];
  depotMails: DepotMail[];
  stock: StockItem[];
  depotOrders: DepotOrder[];
}

// ————— Demo fixtures (Spedition Berger GmbH, Schwäbisch Hall) —————

const initialState: SuiteState = {
  offers: [
    { id: 'OF-118', broker: 'CTL Logistics', from: 'Schwäbisch Hall', to: 'Köln', cargo: '8 Paletten Getränke', rateCents: 68000, pickup: '18.09. 07:00', status: 'new' },
    { id: 'OF-119', broker: 'NTG Nielsen', from: 'Heilbronn', to: 'Hamburg', cargo: '12 Paletten Verpackung', rateCents: 115000, pickup: '18.09. 12:00', status: 'new' },
    { id: 'OF-120', broker: 'Hegelmann', from: 'Öhringen', to: 'München', cargo: '6 Paletten Maschinenteile', rateCents: 54000, pickup: '19.09. 06:30', status: 'countered', counterCents: 61000 },
    { id: 'OF-121', broker: 'Transimeksa', from: 'Crailsheim', to: 'Würzburg', cargo: '10 Paletten Stahlwaren', rateCents: 42000, pickup: '19.09. 09:00', status: 'new' },
    { id: 'OF-116', broker: 'Lannutti', from: 'Schwäbisch Hall', to: 'Leipzig', cargo: '9 Paletten Baustoffe', rateCents: 92000, pickup: '17.09. 14:00', status: 'won' },
    { id: 'OF-112', broker: 'Raben', from: 'Heilbronn', to: 'Dresden', cargo: '14 Paletten Holz', rateCents: 98000, pickup: '16.09. 08:00', status: 'lost' },
  ],
  drivers: [
    { id: 'd1', name: 'Mehmet Yilmaz', driveTodayMin: 315, breakDueMin: 45, weekMin: 2280 },
    { id: 'd2', name: 'Karl Wagner', driveTodayMin: 480, breakDueMin: 12, weekMin: 2940 },
    { id: 'd3', name: 'Andreas Vogel', driveTodayMin: 120, breakDueMin: 150, weekMin: 1860 },
  ],
  complyDocs: [
    { kind: 'license', holder: 'Karl Wagner', daysLeft: 24 },
    { kind: 'hu', holder: 'SHA-BG 123', daysLeft: 18 },
    { kind: 'tacho', holder: 'SHA-BG 214', daysLeft: 210 },
    { kind: 'adr', holder: 'Mehmet Yilmaz', daysLeft: 340 },
    { kind: 'module', holder: 'Andreas Vogel', daysLeft: -6 },
    { kind: 'hu', holder: 'SHA-BG 208', daysLeft: 64 },
    { kind: 'license', holder: 'Mehmet Yilmaz', daysLeft: 480 },
  ],
  hvacRequests: [
    { id: 'SR-31', channel: 'call', customer: 'Hausverwaltung Kern', body: 'Notfall — Heizungsausfall im Treppenhaus, 8 WE betroffen. Hausverwaltung Kern, Ringweg 14, 74523 Schwäbisch Hall. Bitte heute noch jemanden schicken.', summary: 'Heizungsausfall im Treppenhaus, 8 WE', device: 'Gas-Brennwerttherme', address: 'Ringweg 14, Schwäbisch Hall', urgency: 'crit', suggestedTech: 'Stefan Roth', suggestedSlot: 'Heute 14:00' },
    { id: 'SR-32', channel: 'mail', customer: 'Möbelhaus Schmid', body: 'Guten Tag, unsere Split-Klimaanlage im Verkaufsraum tropft seit gestern. Möbelhaus Schmid, Hauptstraße 12, Schwäbisch Hall. Termin gern morgen vormittag.', summary: 'Klimaanlage im Verkaufsraum tropft', device: 'Split-Klimaanlage', address: 'Hauptstraße 12, Schwäbisch Hall', urgency: 'high', suggestedTech: 'Lena Braun', suggestedSlot: 'Morgen 09:30' },
    { id: 'SR-33', channel: 'form', customer: 'Familie Becher', body: 'Wir hätten gern die jährliche Wartung unserer Wärmepumpe. Familie Becher, Gartenweg 3, Öhringen. Keine Eile, Freitag vormittags passt gut.', summary: 'Wartung Wärmepumpe, jährlich', device: 'LW-Wärmepumpe', address: 'Gartenweg 3, Öhringen', urgency: 'low', suggestedTech: 'Stefan Roth', suggestedSlot: 'Fr 11:00' },
    { id: 'SR-34', channel: 'call', customer: 'Bäckerei Vogt', body: 'Anruf Bäckerei Vogt: Lüftungsanlage über der Backstube ist sehr laut, vermutlich Filter. Marktplatz 5, Crailsheim. Bitte heute vor Ladenschluss.', summary: 'Lüftungsanlage Bäckerei laut, Filter?', device: 'Zentral-Lüftung', address: 'Marktplatz 5, Crailsheim', urgency: 'high', suggestedTech: 'Jonas Wolf', suggestedSlot: 'Heute 16:00' },
    { id: 'SR-35', channel: 'mail', customer: 'Praxis Dr. Sommer', body: 'Sehr geehrte Damen und Herren, in unserem Sanitärbereich kommt kein Warmwasser mehr — Durchlauferhitzer defekt? Praxis Dr. Sommer, Bahnhofstraße 21, Schwäbisch Hall. Möglichst morgen früh.', summary: 'Kein Warmwasser im Sanitärbereich', device: 'Durchlauferhitzer', address: 'Bahnhofstraße 21, Schwäbisch Hall', urgency: 'high', suggestedTech: 'Lena Braun', suggestedSlot: 'Morgen 08:00' },
  ],
  hvacTechs: [
    { id: 't1', name: 'Stefan Roth', skills: 'Heizung · Wärmepumpe' },
    { id: 't2', name: 'Lena Braun', skills: 'Klima · Sanitär' },
    { id: 't3', name: 'Jonas Wolf', skills: 'Lüftung · MSR' },
  ],
  depotMails: [
    { id: 'm1', from: 'Bauzentrum Kern AG', subject: 'Bestellung 10x Estrich, 5x Fliesenkleber', status: 'new',
      body: 'Guten Tag,\nbitte liefern Sie uns bis Freitag:\n10x Estrich 25kg\n5x Fliesenkleber 15kg\nMit freundlichen Grüßen\nEinkauf Bauzentrum Kern' },
    { id: 'm2', from: 'Gärtnerei Sonnenschein', subject: 'Nachbestellung Pflanzsubstrat', status: 'new',
      body: 'Hallo,\nwir benötigen Nachschub: 24 Sack Pflanzsubstrat 70l (SUB-70).\nDanke und viele Grüße\nGärtnerei Sonnenschein' },
    { id: 'm3', from: 'Hotel Krone', subject: 'Bestellung Getränke KW39', status: 'new',
      body: 'Sehr geehrte Damen und Herren,\nfür KW39 bestellen wir:\n12 Kisten Wasserkisten 6x1,5l\n8x Saftkisten 12x0,7l\n6 Bierkisten 20x0,5l\nFreundliche Grüße\nHotel Krone' },
  ],
  stock: [
    { sku: 'EST-25', name: 'Estrich 25kg', qty: 84, reorderAt: 40 },
    { sku: 'FLK-15', name: 'Fliesenkleber 15kg', qty: 61, reorderAt: 30 },
    { sku: 'SUB-70', name: 'Pflanzsubstrat 70l', qty: 36, reorderAt: 40 },
    { sku: 'WAS-05', name: 'Wasserkisten 6×1,5l', qty: 142, reorderAt: 60 },
    { sku: 'SAF-02', name: 'Saftkisten 12×0,7l', qty: 57, reorderAt: 30 },
    { sku: 'BIE-03', name: 'Bierkisten 20×0,5l', qty: 28, reorderAt: 40 },
  ],
  depotOrders: [],
};

// ————— Tiny observable store —————

type Listener = () => void;
let state = initialState;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const suiteStore = {
  get: () => state,
  update: (fn: (s: SuiteState) => SuiteState) => {
    state = fn(state);
    emit();
  },
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSuite(): SuiteState {
  return useSyncExternalStore(suiteStore.subscribe, suiteStore.get);
}

// ————— Actions —————

export function counterOffer(id: string, cents: number) {
  suiteStore.update((s) => ({
    ...s,
    offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'countered' as const, counterCents: cents } : o)),
  }));
}

export function setOfferStatus(id: string, status: OfferStatus) {
  suiteStore.update((s) => ({
    ...s,
    offers: s.offers.map((o) => (o.id === id ? { ...o, status } : o)),
  }));
}

export function handoffToFrachtRadar(id: string) {
  suiteStore.update((s) => ({
    ...s,
    offers: s.offers.map((o) => (o.id === id ? { ...o, handedOff: true } : o)),
  }));
}

export function scheduleHvac(id: string, tech: string, slot: string) {
  suiteStore.update((s) => ({
    ...s,
    hvacRequests: s.hvacRequests.map((r) => (r.id === id ? { ...r, scheduled: { tech, slot } } : r)),
  }));
}

export function createDepotOrder(mailId: string, lines?: { sku: string; qty: number }[]) {
  suiteStore.update((s) => {
    const mail = s.depotMails.find((m) => m.id === mailId);
    if (!mail || mail.status === 'ordered' || !lines?.length) return s;
    const order: DepotOrder = {
      id: `A-${2400 + s.depotOrders.length}`,
      from: mail.from,
      lines,
      status: 'picking',
    };
    const used = new Map(lines.map((l) => [l.sku, l.qty]));
    return {
      ...s,
      depotMails: s.depotMails.map((m) => (m.id === mailId ? { ...m, status: 'ordered' as const } : m)),
      stock: s.stock.map((it) => ({ ...it, qty: it.qty - (used.get(it.sku) ?? 0) })),
      depotOrders: [order, ...s.depotOrders],
    };
  });
}

export function shipDepotOrder(id: string) {
  suiteStore.update((s) => ({
    ...s,
    depotOrders: s.depotOrders.map((o) => (o.id === id ? { ...o, status: 'shipped' as const } : o)),
  }));
}
