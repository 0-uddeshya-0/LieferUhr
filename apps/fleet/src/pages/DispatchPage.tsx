import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, AlertTriangle } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { LoadStatusBadge } from '../components/LoadStatusBadge';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { LoadStatus } from '../types';

const STATUS_TABS: Array<LoadStatus | 'ALL'> = [
  'ALL', 'NEW', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'INVOICED', 'CANCELLED',
];

export function DispatchPage() {
  const { t, formatDateTime, formatCurrency } = useI18n();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<LoadStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data: overview } = useQuery({ queryKey: ['fleet-overview'], queryFn: fleetApi.overview });
  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['loads', statusFilter, search],
    queryFn: () =>
      fleetApi.loads({
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: fleetApi.drivers });

  const assignMutation = useMutation({
    mutationFn: ({ id, driverId }: { id: string; driverId: string | null }) =>
      fleetApi.assignLoad(id, { driverId, sendDriverEmail: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-overview'] });
    },
  });

  const expiringCount =
    (overview?.expiringDrivers.length ?? 0) + (overview?.expiringVehicles.length ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-display font-bold">{t('dispatch.title')}</h1>
        <div className="flex gap-2">
          <Link to="/import">
            <Button variant="secondary" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              {t('dispatch.import')}
            </Button>
          </Link>
          <Link to="/loads/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              {t('dispatch.new')}
            </Button>
          </Link>
        </div>
      </div>

      {expiringCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-risk-yellow shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">{t('dispatch.alerts.expiringDocs')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {overview?.expiringDrivers.map((d) => (
                <Badge key={d.id} variant="yellow">{t('dispatch.alerts.license', { name: d.name })}</Badge>
              ))}
              {overview?.expiringVehicles.map((v) => (
                <Badge key={v.id} variant="yellow">{t('dispatch.alerts.hu', { plate: v.plate })}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label={t('dispatch.kpi.today')} value={overview?.todayLoads} />
        <KpiCard label={t('dispatch.kpi.unassigned')} value={overview?.unassigned} warn={(overview?.unassigned ?? 0) > 0} />
        <KpiCard label={t('dispatch.kpi.inTransit')} value={overview?.inTransit} />
        <KpiCard
          label={t('dispatch.kpi.revenue')}
          value={overview ? formatCurrency(overview.revenueThisWeekCents) : undefined}
        />
        <KpiCard label={t('dispatch.kpi.pendingPods')} value={overview?.pendingPods} warn={(overview?.pendingPods ?? 0) > 0} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? t('dispatch.all') : t(`loadStatus.${s}` as never)}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder={t('dispatch.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 border rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('dispatch.table.load')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('dispatch.table.route')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">{t('dispatch.table.cargo')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t('dispatch.table.customer')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('dispatch.table.driver')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('dispatch.table.pickup')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('dispatch.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loads.map((load) => (
                <tr key={load.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/loads/${load.id}`} className="text-brand-700 hover:underline">
                      {load.loadNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                    <div className="truncate">{load.pickupAddress}</div>
                    <div className="truncate text-gray-400">→ {load.deliveryAddress}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-[180px] truncate">
                    {load.cargoDescription}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{load.customer.name}</td>
                  <td className="px-4 py-3">
                    {['DELIVERED', 'INVOICED', 'CANCELLED'].includes(load.status) ? (
                      <span className="text-sm text-gray-500">{load.driver?.name ?? '—'}</span>
                    ) : (
                      <select
                        value={load.driverId ?? ''}
                        onChange={(e) => assignMutation.mutate({ id: load.id, driverId: e.target.value || null })}
                        className="text-sm border rounded-lg px-2 py-1 max-w-[140px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">{t('dispatch.unassigned')}</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(load.pickupAt)}</td>
                  <td className="px-4 py-3"><LoadStatusBadge status={load.status} /></td>
                </tr>
              ))}
              {!isLoading && loads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('dispatch.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, warn }: { label: string; value?: number | string; warn?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${warn ? 'border-risk-yellow' : ''}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  );
}
