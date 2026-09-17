import { useI18n } from '../i18n';
import { isDemoMode } from '../demo/config';

export function DemoRibbon() {
  const { t } = useI18n();
  if (!isDemoMode) return null;
  return (
    <div className="bg-uhr px-4 py-1.5 text-center text-xs font-medium text-uhr-ink">
      {t('demo.banner')}
    </div>
  );
}
