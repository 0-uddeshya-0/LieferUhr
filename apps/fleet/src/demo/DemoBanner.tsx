import { useI18n } from '../i18n';

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-brand-900 text-white text-sm px-4 py-2 text-center">
      {t('demo.banner')}
    </div>
  );
}
