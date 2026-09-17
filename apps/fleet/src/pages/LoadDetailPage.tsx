import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, Check, BellRing, FileText } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { LoadStatusBadge } from '../components/LoadStatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { LoadStatus } from '../types';

const NEXT_STATUSES: Record<LoadStatus, LoadStatus[]> = {
  NEW: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  INVOICED: [],
  CANCELLED: [],
};

export function LoadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, formatDateTime, formatCurrency, statusLabel } = useI18n();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);
  const [net, setNet] = useState('');
  const [dueDays, setDueDays] = useState('14');
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [pingDone, setPingDone] = useState(false);

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', id],
    queryFn: () => fleetApi.load(id!),
    enabled: !!id,
  });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: fleetApi.drivers });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: fleetApi.vehicles });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['load', id] });
    queryClient.invalidateQueries({ queryKey: ['loads'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-overview'] });
  };

  const assignMutation = useMutation({
    mutationFn: (body: { driverId?: string | null; vehicleId?: string | null; sendDriverEmail?: boolean }) =>
      fleetApi.assignLoad(id!, body),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: (status: LoadStatus) => fleetApi.setLoadStatus(id!, status),
    onSuccess: invalidate,
  });

  const pingMutation = useMutation({
    mutationFn: () => fleetApi.pingDriver(id!),
    onSuccess: () => setPingDone(true),
  });

  const invoiceMutation = useMutation({
    mutationFn: () =>
      fleetApi.issueInvoice(id!, {
        netCents: net ? Math.round(parseFloat(net) * 100) : undefined,
        dueDays: parseInt(dueDays, 10) || 14,
      }),
    onSuccess: invalidate,
    onError: (e) => {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setInvoiceError(msg ?? t('common.error'));
    },
  });

  if (isLoading || !load) {
    return <div className="text-neu-muted py-10 text-center">{t('common.loading')}</div>;
  }

  const baseUrl = window.location.origin;
  const driverUrl = `${baseUrl}/t/${load.driverToken}`;
  const trackUrl = `${baseUrl}/l/${load.trackingToken}`;

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dispatch" className="text-neu-muted hover:text-neu-text">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-display font-bold">{load.loadNumber}</h1>
        <LoadStatusBadge status={load.status} />
        <span className="text-sm text-neu-muted ml-auto">{load.customer.name}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="neu-card">
            <div>
              <h3 className="text-sm font-medium text-neu-muted">{t('load.pickup')}</h3>
              <p className="mt-1 font-medium">{load.pickupAddress}</p>
              <p className="text-sm text-neu-muted">{formatDateTime(load.pickupAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neu-muted">{t('load.delivery')}</h3>
              <p className="mt-1 font-medium">{load.deliveryAddress}</p>
              <p className="text-sm text-neu-muted">{formatDateTime(load.deliveryAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neu-muted">{t('load.cargo')}</h3>
              <p className="mt-1">{load.cargoDescription}</p>
              <p className="text-sm text-neu-muted">
                {[load.pallets ? `${load.pallets} Pal.` : null, load.weightKg ? `${load.weightKg} kg` : null]
                  .filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neu-muted">{t('load.price')}</h3>
              <p className="mt-1">{load.priceCents != null ? formatCurrency(load.priceCents) : '—'}</p>
            </div>
            {load.notes && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-neu-muted">{t('load.notes')}</h3>
                <p className="mt-1 text-sm">{load.notes}</p>
              </div>
            )}
          </div>

          <div className="neu-card">
            <h3 className="text-sm font-medium text-neu-muted mb-4">{t('load.status.set')}</h3>
            <div className="flex flex-wrap gap-2">
              {NEXT_STATUSES[load.status].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === 'CANCELLED' ? 'danger' : 'secondary'}
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    if (s === 'CANCELLED' && !window.confirm(t('load.confirm.cancel'))) return;
                    statusMutation.mutate(s);
                  }}
                >
                  → {statusLabel(s)}
                </Button>
              ))}
              {NEXT_STATUSES[load.status].length === 0 && (
                <span className="text-sm text-neu-muted/70">—</span>
              )}
            </div>
          </div>

          <div className="neu-card">
            <h3 className="text-sm font-medium text-neu-muted mb-4">{t('load.timeline')}</h3>
            <ul className="space-y-3">
              {(load.events ?? []).map((e) => (
                <li key={e.id} className="flex items-start gap-3 text-sm">
                  <LoadStatusBadge status={e.status} />
                  <div>
                    <span className="text-neu-muted">{formatDateTime(e.createdAt)} · {e.source}</span>
                    {e.note && <p className="text-neu-text">{e.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="neu-card">
            <h3 className="text-sm font-medium text-neu-muted mb-4">{t('load.pods')}</h3>
            {load.pods.length === 0 ? (
              <p className="text-sm text-neu-muted">{t('load.podEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {load.pods.map((pod) => (
                  <li key={pod.id}>
                    <a
                      href={fleetApi.podUrl(load.id, pod.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-700 hover:underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      {pod.fileName}
                    </a>
                    <span className="text-xs text-neu-muted/70 ml-2">{formatDateTime(pod.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="neu-card">
            <div>
              <label className="block text-sm font-medium text-neu-muted">{t('load.driver')}</label>
              <select
                value={load.driverId ?? ''}
                onChange={(e) =>
                  assignMutation.mutate({ driverId: e.target.value || null, vehicleId: load.vehicleId, sendDriverEmail: true })
                }
                className="mt-1 w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">—</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neu-muted">{t('load.vehicle')}</label>
              <select
                value={load.vehicleId ?? ''}
                onChange={(e) =>
                  assignMutation.mutate({ driverId: load.driverId, vehicleId: e.target.value || null, sendDriverEmail: false })
                }
                className="mt-1 w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">—</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plate}</option>
                ))}
              </select>
            </div>
            {load.driver && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={pingMutation.isPending || pingDone}
                onClick={() => pingMutation.mutate()}
              >
                <BellRing className="w-4 h-4 mr-1" />
                {pingDone ? t('load.pingSent') : t('load.pingDriver')}
              </Button>
            )}
          </div>

          <div className="neu-card">
            <h3 className="text-sm font-medium text-neu-muted">{t('load.links')}</h3>
            {[
              { key: 'driver', label: t('load.driverLink'), url: driverUrl, hint: t('load.linkHint.driver') },
              { key: 'track', label: t('load.trackingLink'), url: trackUrl, hint: t('load.linkHint.tracking') },
            ].map(({ key, label, url, hint }) => (
              <div key={key}>
                <p className="text-sm font-medium">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-neu-sunken/60 shadow-neu-inset-sm rounded-lg px-2 py-1.5 truncate">{url}</code>
                  <button
                    type="button"
                    onClick={() => copy(url, key)}
                    className="p-1.5 text-neu-muted hover:text-neu-text"
                    title={t('common.copy')}
                  >
                    {copied === key ? <Check className="w-4 h-4 text-risk-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-neu-muted/70 mt-1">{hint}</p>
              </div>
            ))}
          </div>

          <div className="neu-card">
            <h3 className="text-sm font-medium text-neu-muted mb-3">{t('load.invoice')}</h3>
            {load.invoice ? (
              <div className="space-y-2">
                <p className="text-sm">
                  {t('load.invoice.issued', { number: load.invoice.invoiceNumber })} ·{' '}
                  {formatCurrency(load.invoice.grossCents)}
                </p>
                <a
                  href={fleetApi.invoicePdfUrl(load.invoice.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-700 hover:underline"
                >
                  {t('load.invoice.download')}
                </a>
              </div>
            ) : load.status === 'DELIVERED' ? (
              <div className="space-y-3">
                <Input
                  label={t('load.invoice.net')}
                  type="number"
                  step="0.01"
                  placeholder={load.priceCents != null ? String(load.priceCents / 100) : ''}
                  value={net}
                  onChange={(e) => setNet(e.target.value)}
                />
                <Input
                  label={t('load.invoice.dueDays')}
                  type="number"
                  value={dueDays}
                  onChange={(e) => setDueDays(e.target.value)}
                />
                {invoiceError && <p className="text-sm text-risk-red">{invoiceError}</p>}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={invoiceMutation.isPending}
                  onClick={() => {
                    if (!net && load.priceCents == null) {
                      setInvoiceError(t('load.invoice.needPrice'));
                      return;
                    }
                    setInvoiceError(null);
                    invoiceMutation.mutate();
                  }}
                >
                  {t('load.invoice.issue')}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-neu-muted">{t('load.invoice.none')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
