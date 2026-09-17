import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, PackageCheck } from 'lucide-react';
import { publicApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';
import { LoadStatusBadge } from '../components/LoadStatusBadge';

export function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const { t, formatDateTime } = useI18n();

  const { data: load, isLoading } = useQuery({
    queryKey: ['track', token],
    queryFn: () => publicApi.track(token!),
    enabled: !!token,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <span className="font-bold text-brand-900">FrachtRadar</span>
          </div>
          <LanguageToggle />
        </div>

        {isLoading && <p className="text-center text-gray-500">{t('common.loading')}</p>}
        {!isLoading && !load && <p className="text-center text-risk-red">{t('track.notFound')}</p>}

        {load && (
          <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div>
              <p className="text-xs text-gray-400">{t('track.by', { name: load.carrierName })}</p>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-xl font-bold">{load.loadNumber}</h1>
                <LoadStatusBadge status={load.status} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p>{load.cargoDescription}</p>
              <p className="text-gray-500">→ {load.deliveryAddress}</p>
              <p className="text-gray-500">
                {t('track.deliveryEta')}: {formatDateTime(load.deliveryAt)}
              </p>
              {load.deliveredAt && (
                <p className="text-risk-green font-medium">
                  {t('track.deliveredAt')}: {formatDateTime(load.deliveredAt)}
                </p>
              )}
            </div>

            {load.podAvailable && (
              <a
                href={publicApi.trackPodUrl(token!)}
                className="flex items-center justify-center gap-2 w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700"
              >
                <Download className="w-5 h-5" />
                {t('track.pod')}
              </a>
            )}

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">{t('track.timeline')}</h2>
              <ul className="space-y-3">
                {load.events.map((e, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <PackageCheck className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{e.statusLabel}</span>
                    <span className="text-gray-400 ml-auto">{formatDateTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-400 text-center">{t('track.footer')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
