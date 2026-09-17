import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const FormSchema = z.object({
  loadNumber: z.string().min(1),
  customerId: z.string().min(1),
  pickupAddress: z.string().min(1),
  pickupAt: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryAt: z.string().min(1),
  cargoDescription: z.string().min(1),
  weightKg: z.string().optional(),
  pallets: z.string().optional(),
  price: z.string().optional(),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof FormSchema>;

export function NewLoadPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fleetApi.customers });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: fleetApi.drivers });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: fleetApi.vehicles });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => fleetApi.createLoad(body),
    onSuccess: (load) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-overview'] });
      navigate(`/loads/${load.id}`);
    },
    onError: () => setServerError(t('common.error')),
  });

  const onSubmit = (data: FormData) => {
    setServerError(null);
    createMutation.mutate({
      loadNumber: data.loadNumber,
      customerId: data.customerId,
      pickupAddress: data.pickupAddress,
      pickupAt: new Date(data.pickupAt).toISOString(),
      deliveryAddress: data.deliveryAddress,
      deliveryAt: new Date(data.deliveryAt).toISOString(),
      cargoDescription: data.cargoDescription,
      weightKg: data.weightKg ? parseInt(data.weightKg, 10) : undefined,
      pallets: data.pallets ? parseInt(data.pallets, 10) : undefined,
      priceCents: data.price ? Math.round(parseFloat(data.price) * 100) : undefined,
      driverId: data.driverId || undefined,
      vehicleId: data.vehicleId || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-6">{t('newLoad.title')}</h1>

      {customers.length === 0 && (
        <div className="bg-yellow-100/70 rounded-xl shadow-neu-inset p-4 mb-6 text-sm text-yellow-900">
          {t('newLoad.needCustomer')}{' '}
          <Link to="/customers" className="font-medium underline">{t('newLoad.addCustomer')}</Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="neu-card">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('newLoad.loadNumber')} {...register('loadNumber')} error={errors.loadNumber?.message} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neu-text">{t('newLoad.customer')}</label>
            <select
              {...register('customerId')}
              className="w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-sm text-risk-red">{errors.customerId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t('newLoad.pickupAddress')} {...register('pickupAddress')} error={errors.pickupAddress?.message} />
          <Input label={t('newLoad.pickupAt')} type="datetime-local" {...register('pickupAt')} error={errors.pickupAt?.message} />
          <Input label={t('newLoad.deliveryAddress')} {...register('deliveryAddress')} error={errors.deliveryAddress?.message} />
          <Input label={t('newLoad.deliveryAt')} type="datetime-local" {...register('deliveryAt')} error={errors.deliveryAt?.message} />
        </div>

        <Input label={t('newLoad.cargo')} {...register('cargoDescription')} error={errors.cargoDescription?.message} />

        <div className="grid grid-cols-3 gap-4">
          <Input label={t('newLoad.weight')} type="number" {...register('weightKg')} />
          <Input label={t('newLoad.pallets')} type="number" {...register('pallets')} />
          <Input label={t('newLoad.price')} type="number" step="0.01" {...register('price')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neu-text">{t('newLoad.driver')}</label>
            <select
              {...register('driverId')}
              className="w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">—</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neu-text">{t('newLoad.vehicle')}</label>
            <select
              {...register('vehicleId')}
              className="w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">—</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate}{v.type ? ` (${v.type})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <Input label={t('load.notes')} {...register('notes')} />

        {serverError && <p className="text-sm text-risk-red" role="alert">{serverError}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {t('newLoad.create')}
          </Button>
          <Link to="/dispatch">
            <Button type="button" variant="secondary">{t('common.cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
