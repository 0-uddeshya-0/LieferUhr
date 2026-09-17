import { apiClient } from './client';
import { isDemoMode } from '../demo/config';
import { demoFleetApi, demoPublicApi } from '../demo/store';
import type {
  Driver, DriverLoadView, FleetCustomer, FleetOverview, Invoice, Load, LoadStatus,
  TrackingView, Vehicle,
} from '../types';

const realFleetApi = {
  overview: () => apiClient.get<FleetOverview>('/fleet/overview').then((r) => r.data),

  customers: () => apiClient.get<FleetCustomer[]>('/customers').then((r) => r.data),
  createCustomer: (body: Partial<FleetCustomer>) =>
    apiClient.post<FleetCustomer>('/customers', body).then((r) => r.data),
  updateCustomer: (id: string, body: Partial<FleetCustomer>) =>
    apiClient.patch<FleetCustomer>(`/customers/${id}`, body).then((r) => r.data),
  deleteCustomer: (id: string) => apiClient.delete(`/customers/${id}`).then((r) => r.data),
  importCustomers: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ imported: number; errors: Array<{ row: number; message: string }> }>(
      '/customers/import', fd
    ).then((r) => r.data);
  },

  drivers: () => apiClient.get<Driver[]>('/drivers').then((r) => r.data),
  createDriver: (body: Partial<Driver>) => apiClient.post<Driver>('/drivers', body).then((r) => r.data),
  updateDriver: (id: string, body: Partial<Driver>) =>
    apiClient.patch<Driver>(`/drivers/${id}`, body).then((r) => r.data),
  deleteDriver: (id: string) => apiClient.delete(`/drivers/${id}`).then((r) => r.data),

  vehicles: () => apiClient.get<Vehicle[]>('/vehicles').then((r) => r.data),
  createVehicle: (body: Partial<Vehicle>) =>
    apiClient.post<Vehicle>('/vehicles', body).then((r) => r.data),
  updateVehicle: (id: string, body: Partial<Vehicle>) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, body).then((r) => r.data),
  deleteVehicle: (id: string) => apiClient.delete(`/vehicles/${id}`).then((r) => r.data),

  loads: (params?: Record<string, string>) =>
    apiClient.get<Load[]>('/loads', { params }).then((r) => r.data),
  load: (id: string) => apiClient.get<Load>(`/loads/${id}`).then((r) => r.data),
  createLoad: (body: Record<string, unknown>) => apiClient.post<Load>('/loads', body).then((r) => r.data),
  updateLoad: (id: string, body: Record<string, unknown>) =>
    apiClient.patch<Load>(`/loads/${id}`, body).then((r) => r.data),
  assignLoad: (id: string, body: { driverId?: string | null; vehicleId?: string | null; sendDriverEmail?: boolean }) =>
    apiClient.post<Load>(`/loads/${id}/assign`, body).then((r) => r.data),
  setLoadStatus: (id: string, status: LoadStatus, note?: string) =>
    apiClient.patch<Load>(`/loads/${id}/status`, { status, note }).then((r) => r.data),
  pingDriver: (id: string) => apiClient.post(`/loads/${id}/ping-driver`).then((r) => r.data),
  importLoads: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ imported: number; errors: Array<{ row: number; message: string }> }>(
      '/loads/import', fd
    ).then((r) => r.data);
  },

  invoices: () => apiClient.get<Invoice[]>('/invoices').then((r) => r.data),
  issueInvoice: (loadId: string, body: { netCents?: number; taxRateBps?: number; dueDays?: number }) =>
    apiClient.post<Invoice>(`/loads/${loadId}/invoice`, body).then((r) => r.data),
  markPaid: (id: string) => apiClient.patch<Invoice>(`/invoices/${id}/paid`).then((r) => r.data),
  invoicePdfUrl: (id: string) => `${apiClient.defaults.baseURL}/invoices/${id}/pdf`,
  podUrl: (loadId: string, podId: string) =>
    `${apiClient.defaults.baseURL}/loads/${loadId}/pod/${podId}`,

  billingSettings: () =>
    apiClient.get<{ street?: string; zip?: string; city?: string; taxId?: string; invoicePrefix?: string }>(
      '/settings/billing'
    ).then((r) => r.data),
  saveBillingSettings: (body: Record<string, string>) =>
    apiClient.put('/settings/billing', body).then((r) => r.data),
};

// Public, token-scoped endpoints (no auth)
const realPublicApi = {
  driverLoad: (token: string) =>
    apiClient.get<DriverLoadView>(`/t/${token}`).then((r) => r.data),
  driverSetStatus: (token: string, status: LoadStatus, note?: string) =>
    apiClient.post(`/t/${token}/status`, { status, note }).then((r) => r.data),
  driverUploadPod: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ id: string }>(`/t/${token}/pod`, fd).then((r) => r.data);
  },
  track: (token: string) => apiClient.get<TrackingView>(`/l/${token}`).then((r) => r.data),
  trackPodUrl: (token: string) => `${apiClient.defaults.baseURL}/l/${token}/pod`,
};

export const fleetApi = isDemoMode ? demoFleetApi : realFleetApi;
export const publicApi = isDemoMode ? demoPublicApi : realPublicApi;
