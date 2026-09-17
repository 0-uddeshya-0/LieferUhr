import { describe, it, expect } from 'vitest';
import {
  suiteStore,
  counterOffer,
  setOfferStatus,
  handoffToFrachtRadar,
  scheduleHvac,
  createDepotOrder,
  shipDepotOrder,
} from './store';

const s = () => suiteStore.get();

describe('dispatch workflow', () => {
  it('counters an offer and keeps the original rate', () => {
    counterOffer('OF-118', 75000);
    const o = s().offers.find((o) => o.id === 'OF-118')!;
    expect(o.status).toBe('countered');
    expect(o.counterCents).toBe(75000);
    expect(o.rateCents).toBe(68000);
  });

  it('books and hands off a won offer', () => {
    setOfferStatus('OF-118', 'won');
    handoffToFrachtRadar('OF-118');
    const o = s().offers.find((o) => o.id === 'OF-118')!;
    expect(o.status).toBe('won');
    expect(o.handedOff).toBe(true);
  });
});

describe('hvac workflow', () => {
  it('schedules a request with tech and slot', () => {
    scheduleHvac('SR-32', 'Lena Braun', 'Morgen 09:30');
    const r = s().hvacRequests.find((r) => r.id === 'SR-32')!;
    expect(r.scheduled).toEqual({ tech: 'Lena Braun', slot: 'Morgen 09:30' });
  });
});

describe('depot workflow', () => {
  it('creates an order and decrements stock', () => {
    const before = s().stock.find((x) => x.sku === 'EST-25')!.qty;
    createDepotOrder('m1');
    const mail = s().depotMails.find((m) => m.id === 'm1')!;
    const stock = s().stock.find((x) => x.sku === 'EST-25')!;
    const order = s().depotOrders[0];
    expect(mail.status).toBe('ordered');
    expect(stock.qty).toBe(before - 10);
    expect(order.status).toBe('picking');
    expect(order.lines).toHaveLength(2);
  });

  it('does not double-create an order for the same mail', () => {
    const count = s().depotOrders.length;
    createDepotOrder('m1');
    expect(s().depotOrders.length).toBe(count);
  });

  it('ships a picking order', () => {
    shipDepotOrder(s().depotOrders[0].id);
    expect(s().depotOrders[0].status).toBe('shipped');
  });
});
