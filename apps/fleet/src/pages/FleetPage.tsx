import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

function ExpiryBadge({ date, t, formatDate }: { date?: string | null; t: (k: never) => string; formatDate: (d: string) => string }) {
  if (!date) return <span className="text-neu-muted/70">—</span>;
  const d = new Date(date);
  const now = Date.now();
  const in30 = now + 30 * 86400000;
  if (d.getTime() < now) return <Badge variant="red">{t('fleet.expired' as never)} · {formatDate(date)}</Badge>;
  if (d.getTime() < in30) return <Badge variant="yellow">{t('fleet.expiresSoon' as never)} · {formatDate(date)}</Badge>;
  return <span className="text-sm text-neu-muted">{formatDate(date)}</span>;
}

export function FleetPage() {
  const { t, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', email: '', licenseValidUntil: '' });
  const [vehicleForm, setVehicleForm] = useState({ plate: '', type: '', nextInspectionAt: '' });

  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: fleetApi.drivers });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: fleetApi.vehicles });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['drivers'] });
  const invalidateV = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });

  const addDriver = useMutation({
    mutationFn: () =>
      fleetApi.createDriver({
        name: driverForm.name,
        phone: driverForm.phone || undefined,
        email: driverForm.email || undefined,
        licenseValidUntil: driverForm.licenseValidUntil ? new Date(driverForm.licenseValidUntil).toISOString() : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setShowDriverForm(false);
      setDriverForm({ name: '', phone: '', email: '', licenseValidUntil: '' });
    },
  });

  const addVehicle = useMutation({
    mutationFn: () =>
      fleetApi.createVehicle({
        plate: vehicleForm.plate,
        type: vehicleForm.type || undefined,
        nextInspectionAt: vehicleForm.nextInspectionAt ? new Date(vehicleForm.nextInspectionAt).toISOString() : undefined,
      }),
    onSuccess: () => {
      invalidateV();
      setShowVehicleForm(false);
      setVehicleForm({ plate: '', type: '', nextInspectionAt: '' });
    },
  });

  const delDriver = useMutation({ mutationFn: fleetApi.deleteDriver, onSuccess: invalidate });
  const delVehicle = useMutation({ mutationFn: fleetApi.deleteVehicle, onSuccess: invalidateV });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t('fleet.title')}</h1>
        <Button size="sm" onClick={() => (tab === 'drivers' ? setShowDriverForm(true) : setShowVehicleForm(true))}>
          <Plus className="w-4 h-4 mr-1" />
          {tab === 'drivers' ? t('fleet.addDriver') : t('fleet.addVehicle')}
        </Button>
      </div>

      <div className="flex gap-1">
        {(['drivers', 'vehicles'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === v ? 'bg-brand-600 text-white' : 'neu-btn text-neu-muted hover:bg-neu-sunken/60'
            }`}
          >
            {v === 'drivers' ? t('fleet.drivers') : t('fleet.vehicles')}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <>
          {showDriverForm && (
            <div className="neu-card">
              <Input label={t('common.name')} value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} />
              <Input label={t('common.phone')} value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} />
              <Input label={t('common.email')} type="email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} />
              <Input label={t('fleet.licenseUntil')} type="date" value={driverForm.licenseValidUntil} onChange={(e) => setDriverForm({ ...driverForm, licenseValidUntil: e.target.value })} />
              <div className="md:col-span-4 flex items-center gap-3">
                <p className="text-xs text-neu-muted/70 flex-1">{t('fleet.driverEmailHint')}</p>
                <Button size="sm" disabled={!driverForm.name || addDriver.isPending} onClick={() => addDriver.mutate()}>
                  {t('common.save')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDriverForm(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}
          <div className="neu-card">
            <table className="w-full text-sm">
              <thead className="bg-neu-sunken/60 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('common.name')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('common.phone')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('common.email')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('fleet.licenseUntil')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('fleet.activeLoads')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-neu-muted">{d.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-neu-muted">{d.email ?? '—'}</td>
                    <td className="px-4 py-3"><ExpiryBadge date={d.licenseValidUntil} t={t} formatDate={formatDate} /></td>
                    <td className="px-4 py-3 text-neu-muted">{d._count?.loads ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => delDriver.mutate(d.id)} className="text-neu-muted/70 hover:text-risk-red">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-neu-muted">{t('fleet.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'vehicles' && (
        <>
          {showVehicleForm && (
            <div className="neu-card">
              <Input label={t('fleet.plate')} value={vehicleForm.plate} onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value })} />
              <Input label={t('fleet.type')} value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })} />
              <Input label={t('fleet.huUntil')} type="date" value={vehicleForm.nextInspectionAt} onChange={(e) => setVehicleForm({ ...vehicleForm, nextInspectionAt: e.target.value })} />
              <div className="md:col-span-3 flex gap-3">
                <Button size="sm" disabled={!vehicleForm.plate || addVehicle.isPending} onClick={() => addVehicle.mutate()}>
                  {t('common.save')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowVehicleForm(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}
          <div className="neu-card">
            <table className="w-full text-sm">
              <thead className="bg-neu-sunken/60 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('fleet.plate')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('fleet.type')}</th>
                  <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('fleet.huUntil')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-medium">{v.plate}</td>
                    <td className="px-4 py-3 text-neu-muted">{v.type ?? '—'}</td>
                    <td className="px-4 py-3"><ExpiryBadge date={v.nextInspectionAt} t={t} formatDate={formatDate} /></td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => delVehicle.mutate(v.id)} className="text-neu-muted/70 hover:text-risk-red">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-neu-muted">{t('fleet.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
