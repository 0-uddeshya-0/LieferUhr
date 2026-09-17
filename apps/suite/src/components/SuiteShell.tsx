import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { isDemoMode } from '../demo/config';
import { ProductMark, type ProductId } from './ProductMark';
import type { TranslationKey } from '../i18n/translations';

// The umbrella site sits one level up in the Pages deploy.
const UMBRELLA = `${import.meta.env.BASE_URL}../`;

export function DemoRibbon() {
  const { t } = useI18n();
  if (!isDemoMode) return null;
  return (
    <div className="bg-uhr px-4 py-1.5 text-center text-xs font-medium text-uhr-ink">
      {t('demo.banner')}
    </div>
  );
}

export function SuiteHeader({ product }: { product?: ProductId }) {
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {isDemoMode && (
          <a href={UMBRELLA} className="text-subtle transition-colors hover:text-ink" aria-label={t('suite.back')}>
            <ArrowLeft className="h-5 w-5" />
          </a>
        )}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <ProductMark product="suite" className="h-8 w-8" />
          <span className="truncate font-display text-base font-semibold text-ink">
            {t('suite.name')}
          </span>
        </Link>
        {product && (
          <span className="hidden items-center gap-2 border-l border-rule pl-3 sm:flex">
            <ProductMark product={product} className="h-6 w-6" />
            <span className="font-display text-sm font-medium text-ink-soft">
              {t(`product.${product}.name` as TranslationKey)}
            </span>
          </span>
        )}
      </div>
      <LanguageToggle />
    </header>
  );
}
