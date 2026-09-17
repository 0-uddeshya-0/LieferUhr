import { PrismaClient, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.podUpload.deleteMany();
  await prisma.loadEvent.deleteMany();
  await prisma.load.deleteMany();
  await prisma.fleetCustomer.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash('Test1234!', 12);

  const org = await prisma.organization.create({
    data: {
      name: 'Muster Maschinenbau GmbH',
      email: 'manager@muster.de',
      users: {
        create: {
          email: 'manager@muster.de',
          passwordHash,
          name: 'Hans Müller',
        },
      },
    },
  });

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Stahlwerk Müller GmbH',
        contactEmail: 'bestellung@stahlwerk-mueller.de',
        contactName: 'Klaus Müller',
      },
    }),
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Hydraulik Schmidt KG',
        contactEmail: 'auftrag@hydraulik-schmidt.de',
        contactName: 'Anna Schmidt',
      },
    }),
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Elektrotechnik Weber',
        contactEmail: 'lieferung@elektro-weber.de',
        contactName: 'Peter Weber',
      },
    }),
  ]);

  const ordersData = [
    {
      supplierId: suppliers[0].id,
      orderNumber: 'PO-2024-001',
      partDescription: 'Stahlblech 3mm',
      quantity: 50,
      unit: 'Stück',
      dueDate: new Date('2026-07-15'),
      status: 'PENDING' as OrderStatus,
    },
    {
      supplierId: suppliers[1].id,
      orderNumber: 'PO-2024-002',
      partDescription: 'Hydraulikzylinder 50mm',
      quantity: 10,
      unit: 'Stück',
      dueDate: new Date('2026-06-20'),
      status: 'RECEIVED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-06-01'),
    },
    {
      supplierId: suppliers[1].id,
      orderNumber: 'PO-2024-003',
      partDescription: 'Hydraulikschlauch DN16',
      quantity: 20,
      unit: 'm',
      dueDate: new Date('2026-05-01'),
      status: 'DELAYED' as OrderStatus,
      statusNote: 'Materialengpass beim Hersteller',
      lastSupplierUpdate: new Date('2026-05-20'),
    },
    {
      supplierId: suppliers[2].id,
      orderNumber: 'PO-2024-004',
      partDescription: 'Steuerungsschrank IP54',
      quantity: 2,
      unit: 'Stück',
      dueDate: new Date('2026-06-25'),
      status: 'SHIPPED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-06-08'),
    },
    {
      supplierId: suppliers[0].id,
      orderNumber: 'PO-2024-005',
      partDescription: 'Schweißdraht ER70S-6',
      quantity: 100,
      unit: 'kg',
      dueDate: new Date('2026-05-15'),
      status: 'DELIVERED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-05-14'),
    },
  ];

  for (const data of ordersData) {
    const order = await prisma.order.create({
      data: {
        orgId: org.id,
        ...data,
        events: {
          create: [{ status: 'PENDING', source: 'manager' }],
        },
      },
    });

    if (data.status !== 'PENDING') {
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          status: data.status,
          note: data.statusNote,
          source: data.status === 'DELIVERED' ? 'manager' : 'supplier',
        },
      });
    }
  }

  // --- FrachtRadar carrier org ---
  const carrier = await prisma.organization.create({
    data: {
      name: 'Spedition Berger GmbH',
      email: 'disponent@frachtradar.de',
      street: 'Am Güterbahnhof 4',
      zip: '86153',
      city: 'Augsburg',
      taxId: 'DE123456789',
      users: {
        create: {
          email: 'disponent@frachtradar.de',
          passwordHash,
          name: 'Sabine Berger',
        },
      },
    },
  });

  const [shipper1, shipper2] = await Promise.all([
    prisma.fleetCustomer.create({
      data: {
        orgId: carrier.id,
        name: 'Muster Maschinenbau GmbH',
        contactName: 'Hans Müller',
        contactEmail: 'wareneingang@muster.de',
        address: 'Industriestr. 12, 86150 Augsburg',
      },
    }),
    prisma.fleetCustomer.create({
      data: {
        orgId: carrier.id,
        name: 'Bauzentrum Lech',
        contactEmail: 'lager@bauzentrum-lech.de',
        address: 'Lechhauser Str. 40, 86165 Augsburg',
      },
    }),
  ]);

  const [driver1, driver2] = await Promise.all([
    prisma.driver.create({
      data: {
        orgId: carrier.id,
        name: 'Mehmet Yilmaz',
        phone: '+49 171 5551234',
        email: 'mehmet@spedition-berger.de',
        licenseValidUntil: new Date('2027-03-15'),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: carrier.id,
        name: 'Jan Kowalski',
        phone: '+49 172 5559876',
        licenseValidUntil: new Date('2026-10-01'),
      },
    }),
  ]);

  const [truck1, truck2] = await Promise.all([
    prisma.vehicle.create({
      data: { orgId: carrier.id, plate: 'A-SB 1201', type: '7.5t Koffer', nextInspectionAt: new Date('2027-01-20') },
    }),
    prisma.vehicle.create({
      data: { orgId: carrier.id, plate: 'A-SB 0440', type: 'Sattelzug 40t', nextInspectionAt: new Date('2026-10-05') },
    }),
  ]);

  const now = Date.now();
  const loadsData = [
    {
      loadNumber: 'T-2601',
      customerId: shipper1.id,
      pickupAddress: 'Industriestr. 12, 86150 Augsburg',
      deliveryAddress: 'Werk 2, Werner-von-Siemens-Str. 5, 86155 Augsburg',
      cargoDescription: 'Maschinenteile, 4 Paletten',
      pallets: 4,
      weightKg: 2100,
      priceCents: 28500,
      status: 'NEW' as const,
      pickupAt: new Date(now + 4 * 3600 * 1000),
      deliveryAt: new Date(now + 8 * 3600 * 1000),
    },
    {
      loadNumber: 'T-2602',
      customerId: shipper2.id,
      pickupAddress: 'Lechhauser Str. 40, 86165 Augsburg',
      deliveryAddress: 'Baustelle Nord, Zeppelinstr. 8, 86169 Augsburg',
      cargoDescription: 'Baustahl, 2 Bunde',
      weightKg: 4800,
      priceCents: 34000,
      status: 'DISPATCHED' as const,
      driverId: driver1.id,
      vehicleId: truck1.id,
      pickupAt: new Date(now - 3600 * 1000),
      deliveryAt: new Date(now + 3 * 3600 * 1000),
    },
    {
      loadNumber: 'T-2598',
      customerId: shipper1.id,
      pickupAddress: 'Industriestr. 12, 86150 Augsburg',
      deliveryAddress: 'Zentrallager, Gewerbering 22, 86368 Gersthofen',
      cargoDescription: 'Steuerungsschränke, 3 Paletten',
      pallets: 3,
      weightKg: 1450,
      priceCents: 22000,
      status: 'DELIVERED' as const,
      driverId: driver2.id,
      vehicleId: truck2.id,
      pickupAt: new Date(now - 26 * 3600 * 1000),
      deliveryAt: new Date(now - 24 * 3600 * 1000),
      deliveredAt: new Date(now - 24 * 3600 * 1000),
    },
  ];

  for (const data of loadsData) {
    const { status, ...rest } = data;
    const firstStatus = status === 'DELIVERED' ? 'DISPATCHED' : status;
    const load = await prisma.load.create({
      data: { orgId: carrier.id, status, ...rest, events: { create: { status: firstStatus, source: 'dispatcher' } } },
    });
    if (status === 'DELIVERED') {
      await prisma.loadEvent.createMany({
        data: [
          { loadId: load.id, status: 'PICKED_UP', source: 'driver' },
          { loadId: load.id, status: 'DELIVERED', source: 'driver' },
        ],
      });
    }
  }

  console.log('Seed completed:');
  console.log('  Lieferuhr Einkauf: manager@muster.de / Test1234!');
  console.log('  FrachtRadar: disponent@frachtradar.de / Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
