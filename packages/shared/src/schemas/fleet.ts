import { z } from 'zod';

export const LoadStatusEnum = z.enum([
  'NEW', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'INVOICED', 'CANCELLED'
]);

export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CreateDriverSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  licenseValidUntil: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateDriverSchema = CreateDriverSchema.partial();

export const CreateVehicleSchema = z.object({
  plate: z.string().min(1).max(20),
  type: z.string().max(100).optional(),
  nextInspectionAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export const CreateLoadSchema = z.object({
  customerId: z.string().cuid(),
  loadNumber: z.string().min(1).max(100),
  pickupAddress: z.string().min(1).max(500),
  pickupAt: z.string().datetime(),
  pickupUntil: z.string().datetime().optional(),
  deliveryAddress: z.string().min(1).max(500),
  deliveryAt: z.string().datetime(),
  deliveryUntil: z.string().datetime().optional(),
  cargoDescription: z.string().min(1).max(500),
  weightKg: z.number().int().positive().optional(),
  pallets: z.number().int().nonnegative().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  driverId: z.string().cuid().optional(),
  vehicleId: z.string().cuid().optional(),
  notes: z.string().max(1000).optional(),
});

// Assignment goes through /loads/:id/assign so status transitions and
// notifications stay consistent — PATCH must not move driver/vehicle directly.
export const UpdateLoadSchema = CreateLoadSchema.partial().omit({
  driverId: true,
  vehicleId: true,
});

export const AssignLoadSchema = z.object({
  driverId: z.string().cuid().nullable().optional(),
  vehicleId: z.string().cuid().nullable().optional(),
  sendDriverEmail: z.boolean().default(true),
});

export const UpdateLoadStatusSchema = z.object({
  status: LoadStatusEnum,
  note: z.string().max(1000).optional(),
});

export const DriverStatusUpdateSchema = z.object({
  status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED']),
  note: z.string().max(1000).optional(),
});

export const IssueInvoiceSchema = z.object({
  netCents: z.number().int().nonnegative().optional(),
  taxRateBps: z.number().int().min(0).max(10000).default(1900),
  dueDays: z.number().int().min(0).max(365).default(14),
});

export const UpdateOrgBillingSchema = z.object({
  street: z.string().max(200).optional(),
  zip: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  // Prefix is embedded in the invoice number, which is used in file paths and
  // Content-Disposition headers — keep the charset tight.
  invoicePrefix: z.string().regex(/^[A-Za-z0-9-]{0,20}$/, 'Nur Buchstaben, Ziffern und Bindestriche erlaubt').optional(),
});

export const CustomerCsvRowSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
});

export const LoadCsvRowSchema = z.object({
  loadNumber: z.string().min(1).max(100),
  customerName: z.string().min(1).max(200),
  pickupAddress: z.string().min(1).max(500),
  pickupAt: z.string().min(1),
  deliveryAddress: z.string().min(1).max(500),
  deliveryAt: z.string().min(1),
  cargoDescription: z.string().min(1).max(500),
  weightKg: z.coerce.number().int().positive().optional(),
  pallets: z.coerce.number().int().nonnegative().optional(),
  price: z.coerce.number().nonnegative().optional(),
});

export const LOAD_STATUS_LABELS_DE = {
  NEW: 'Neu',
  DISPATCHED: 'Disponiert',
  PICKED_UP: 'Abgeholt',
  IN_TRANSIT: 'Unterwegs',
  DELIVERED: 'Geliefert',
  INVOICED: 'Berechnet',
  CANCELLED: 'Storniert',
} as const;

export const DRIVER_TRANSITIONS: Record<string, string[]> = {
  DISPATCHED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED'],
  IN_TRANSIT: ['DELIVERED'],
};

export type LoadStatus = z.infer<typeof LoadStatusEnum>;
export type CreateLoadInput = z.infer<typeof CreateLoadSchema>;
export type DriverStatusUpdateInput = z.infer<typeof DriverStatusUpdateSchema>;
