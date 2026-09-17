import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Camera, CheckCircle2, PackageCheck, Truck as TruckIcon, MapPin } from 'lucide-react';
import { publicApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';
import type { LoadStatus } from '../types';

const TOKEN_KEY = 'frachtradar.driverToken';

const ACTION_META: Record<string, { label: string; icon: typeof TruckIcon }> = {
  PICKED_UP: { label: 'driver.action.pickedUp', icon: PackageCheck },
  IN_TRANSIT: { label: 'driver.action.inTransit', icon: TruckIcon },
  DELIVERED: { label: 'driver.action.delivered', icon: CheckCircle2 },
};

export function DriverPage() {
  const { token } = useParams<{ token: string }>();
  const { t, formatDateTime } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');
  const [updated, setUpdated] = useState<LoadStatus | null>(null);
  const [podDone, setPodDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist token so the installed PWA reopens this tour from the home screen.
  useEffect(() => {
    if (token) {
      try { localStorage.setItem(TOKEN_KEY, token); } catch { /* best effort */ }
    }
  }, [token]);

  const { data: load, isLoading, refetch } = useQuery({
    queryKey: ['driver-load', token],
    queryFn: () => publicApi.driverLoad(token!),
    enabled: !!token,
    retry: false,
  });

  const setStatus = async (status: LoadStatus) => {
    setError(null);
    try {
      await publicApi.driverSetStatus(token!, status, note || undefined);
      setUpdated(status);
      setNote('');
      refetch();
    } catch {
      setError(t('driver.error'));
    }
  };

  const uploadPod = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      await publicApi.driverUploadPod(token!, file);
      setPodDone(true);
      refetch();
    } catch {
      setError(t('driver.error'));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <Shell><p className="text-center text-neu-muted">{t('common.loading')}</p></Shell>;
  }

  if (!load) {
    return (
      <Shell>
        <p className="text-center text-risk-red">{t('track.notFound')}</p>
      </Shell>
    );
  }

  const currentStatus = (updated ?? load.status) as LoadStatus;
  const closed = ['DELIVERED', 'INVOICED', 'CANCELLED'].includes(currentStatus);
  const transitions = load.allowedTransitions ?? [];

  return (
    <Shell>
      <div className="neu-card space-y-5">
        <div>
          <p className="text-xs text-neu-muted/70">{t('driver.carrier', { name: load.carrierName })}</p>
          <h1 className="text-xl font-bold">{t('driver.title', { loadNumber: load.loadNumber })}</h1>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neu-muted/70 uppercase">{t('driver.pickup')}</p>
              <p className="font-medium">{load.pickupAddress}</p>
              <p className="text-sm text-neu-muted">{formatDateTime(load.pickupAt)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-risk-green shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neu-muted/70 uppercase">{t('driver.delivery')}</p>
              <p className="font-medium">{load.deliveryAddress}</p>
              <p className="text-sm text-neu-muted">{formatDateTime(load.deliveryAt)}</p>
            </div>
          </div>
          <div className="bg-neu-sunken/60 rounded-lg shadow-neu-inset-sm p-3 text-sm">
            <span className="text-neu-muted/70">{t('driver.cargo')}: </span>
            {load.cargoDescription}
            {load.pallets ? ` · ${load.pallets} Pal.` : ''}
            {load.weightKg ? ` · ${load.weightKg} kg` : ''}
            {load.vehiclePlate ? <span className="block text-neu-muted/70 mt-1">{t('driver.vehicle')}: {load.vehiclePlate}</span> : null}
          </div>
        </div>

        {!closed ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('driver.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neu-bg shadow-neu-inset text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {transitions.map((s) => {
              const meta = ACTION_META[s];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-brand-700 active:scale-[0.99] transition"
                >
                  <Icon className="w-6 h-6" />
                  {t(meta.label as never)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-risk-green font-medium">{t('driver.done')}</p>
        )}

        {updated && !closed && (
          <p className="text-center text-risk-green font-medium">{t('driver.statusUpdated')}</p>
        )}

        <div className="border-t pt-5">
          <h2 className="font-semibold">{t('driver.pod.title')}</h2>
          <p className="text-sm text-neu-muted mt-1">{t('driver.pod.hint')}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPod(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 w-full flex items-center justify-center gap-2 shadow-neu-inset bg-neu-bg py-4 rounded-xl text-neu-muted hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            {uploading ? t('driver.pod.uploading') : t('driver.pod.upload')}
          </button>
          {(podDone || load.podCount > 0) && (
            <p className="mt-2 text-sm text-risk-green font-medium">{t('driver.pod.uploaded')} ({load.podCount + (podDone ? 1 : 0)})</p>
          )}
          <p className="mt-2 text-xs text-neu-muted/70">{t('driver.keepOriginal')}</p>
        </div>

        {error && <p className="text-sm text-risk-red text-center" role="alert">{error}</p>}

        <p className="text-xs text-neu-muted/70 text-center">{t('driver.homescreen')}</p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <span className="font-bold text-brand-900">FrachtRadar<span className="ml-1.5 text-xs font-medium text-neu-muted align-middle">von Lieferuhr</span></span>
          </div>
          <LanguageToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
