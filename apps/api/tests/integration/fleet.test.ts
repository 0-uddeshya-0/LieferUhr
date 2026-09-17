import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/index';
import type { FastifyInstance } from 'fastify';

async function registerOrg(app: FastifyInstance, tag: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      orgName: `Fleet ${tag}`,
      email: `fleet-${tag}-${Date.now()}@example.de`,
      password: 'Test1234!',
      name: 'Dispatcher',
    },
  });
  expect(res.statusCode).toBe(200);
  return Object.fromEntries(res.cookies.map((c) => [c.name, c.value]));
}

describe('Fleet integration', () => {
  let app: FastifyInstance;
  let cookies: Record<string, string>;
  let otherCookies: Record<string, string>;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    cookies = await registerOrg(app, 'a');
    otherCookies = await registerOrg(app, 'b');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    const res = await app.inject({ method: 'GET', url: '/loads' });
    expect(res.statusCode).toBe(401);
  });

  it('runs the full load lifecycle: create → assign → driver updates → invoice', async () => {
    const cust = await app.inject({
      method: 'POST', url: '/customers', cookies,
      payload: { name: 'Werkbau AG', contactEmail: 'lager@werkbau.de', address: 'Werkstr. 1, 86150 Augsburg' },
    });
    expect(cust.statusCode).toBe(201);
    const customerId = cust.json().id;

    const drv = await app.inject({
      method: 'POST', url: '/drivers', cookies,
      payload: { name: 'Test Fahrer', email: 'fahrer@example.de' },
    });
    expect(drv.statusCode).toBe(201);
    const driverId = drv.json().id;

    const veh = await app.inject({
      method: 'POST', url: '/vehicles', cookies,
      payload: { plate: 'A-T 9999', type: '7.5t' },
    });
    expect(veh.statusCode).toBe(201);
    const vehicleId = veh.json().id;

    const loadRes = await app.inject({
      method: 'POST', url: '/loads', cookies,
      payload: {
        loadNumber: `T-${Date.now()}`,
        customerId,
        pickupAddress: 'Werkstr. 1, 86150 Augsburg',
        pickupAt: new Date().toISOString(),
        deliveryAddress: 'Hafenstr. 5, 86159 Augsburg',
        deliveryAt: new Date(Date.now() + 7200000).toISOString(),
        cargoDescription: 'Maschinenteile',
        pallets: 2,
        priceCents: 15000,
      },
    });
    expect(loadRes.statusCode).toBe(201);
    const load = loadRes.json();
    expect(load.status).toBe('NEW');
    // capability tokens must be high-entropy (nanoid(32)), not sequential/cuid
    expect(load.driverToken.length).toBeGreaterThanOrEqual(30);
    expect(load.trackingToken.length).toBeGreaterThanOrEqual(30);

    const assign = await app.inject({
      method: 'POST', url: `/loads/${load.id}/assign`, cookies,
      payload: { driverId, vehicleId, sendDriverEmail: false },
    });
    expect(assign.statusCode).toBe(200);
    expect(assign.json().status).toBe('DISPATCHED');

    // Driver link is public — no cookies
    const view = await app.inject({ method: 'GET', url: `/t/${load.driverToken}` });
    expect(view.statusCode).toBe(200);
    expect(view.json().allowedTransitions).toEqual(['PICKED_UP']);
    expect(view.json().loadNumber).toBe(load.loadNumber);

    // Driver cannot jump the state machine
    const badJump = await app.inject({
      method: 'POST', url: `/t/${load.driverToken}/status`,
      payload: { status: 'DELIVERED' },
    });
    expect(badJump.statusCode).toBe(409);

    for (const status of ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED']) {
      const res = await app.inject({
        method: 'POST', url: `/t/${load.driverToken}/status`,
        payload: { status },
      });
      expect(res.statusCode).toBe(200);
    }

    // Tracking link is public + read-only
    const track = await app.inject({ method: 'GET', url: `/l/${load.trackingToken}` });
    expect(track.statusCode).toBe(200);
    expect(track.json().status).toBe('DELIVERED');
    expect(track.json().carrierName).toContain('Fleet');

    // Invoice requires delivered load; uses org billing defaults
    const inv = await app.inject({
      method: 'POST', url: `/loads/${load.id}/invoice`, cookies,
      payload: { dueDays: 14 },
    });
    expect(inv.statusCode).toBe(201);
    expect(inv.json().invoiceNumber).toBe('RE-0001');
    expect(inv.json().netCents).toBe(15000);
    expect(inv.json().grossCents).toBe(17850);
    expect(inv.json().pdfPath).toContain('.pdf');

    const again = await app.inject({
      method: 'POST', url: `/loads/${load.id}/invoice`, cookies, payload: {},
    });
    expect(again.statusCode).toBe(409);

    const pdf = await app.inject({ method: 'GET', url: `/invoices/${inv.json().id}/pdf`, cookies });
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toBe('application/pdf');
    expect(pdf.rawPayload.subarray(0, 5).toString()).toBe('%PDF-');

    const paid = await app.inject({ method: 'PATCH', url: `/invoices/${inv.json().id}/paid`, cookies });
    expect(paid.json().status).toBe('PAID');
  });

  it('enforces cross-org isolation on fleet resources', async () => {
    const cust = await app.inject({
      method: 'POST', url: '/customers', cookies, payload: { name: 'Secret Kunde' },
    });
    const customerId = cust.json().id;
    const loadRes = await app.inject({
      method: 'POST', url: '/loads', cookies,
      payload: {
        loadNumber: `X-${Date.now()}`, customerId,
        pickupAddress: 'A', pickupAt: new Date().toISOString(),
        deliveryAddress: 'B', deliveryAt: new Date().toISOString(),
        cargoDescription: 'C',
      },
    });
    const loadId = loadRes.json().id;

    const stolen = await app.inject({ method: 'GET', url: `/loads/${loadId}`, cookies: otherCookies });
    expect(stolen.statusCode).toBe(404);
    const stolenCust = await app.inject({ method: 'GET', url: '/customers', cookies: otherCookies });
    expect(stolenCust.json().find((c: { id: string }) => c.id === customerId)).toBeUndefined();

    // Referencing another org's entities must be rejected, not cross-linked:
    // a foreign driverId would leak load details via the dispatch email.
    const foreignDrv = await app.inject({
      method: 'POST', url: '/drivers', cookies, payload: { name: 'Org A Fahrer' },
    });
    const foreignDriverId = foreignDrv.json().id;

    const badCreate = await app.inject({
      method: 'POST', url: '/loads', cookies: otherCookies,
      payload: {
        loadNumber: `Y-${Date.now()}`, customerId,
        pickupAddress: 'A', pickupAt: new Date().toISOString(),
        deliveryAddress: 'B', deliveryAt: new Date().toISOString(),
        cargoDescription: 'C',
      },
    });
    expect(badCreate.statusCode).toBe(400);

    const ownCust = await app.inject({
      method: 'POST', url: '/customers', cookies: otherCookies, payload: { name: 'Org B Kunde' },
    });
    const ownLoad = await app.inject({
      method: 'POST', url: '/loads', cookies: otherCookies,
      payload: {
        loadNumber: `Z-${Date.now()}`, customerId: ownCust.json().id,
        pickupAddress: 'A', pickupAt: new Date().toISOString(),
        deliveryAddress: 'B', deliveryAt: new Date().toISOString(),
        cargoDescription: 'C',
      },
    });
    const badAssign = await app.inject({
      method: 'POST', url: `/loads/${ownLoad.json().id}/assign`, cookies: otherCookies,
      payload: { driverId: foreignDriverId },
    });
    expect(badAssign.statusCode).toBe(400);
  });

  it('rejects invalid tokens and bad input', async () => {
    expect((await app.inject({ method: 'GET', url: '/t/nonexistent' })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: '/l/nonexistent' })).statusCode).toBe(404);
    const bad = await app.inject({
      method: 'POST', url: '/loads', cookies, payload: { loadNumber: '' },
    });
    expect(bad.statusCode).toBe(400);
  });
});
