import { NavLink, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Home, Truck } from 'lucide-react';
import { useI18n } from '../i18n';
import { isDemoMode } from '../demo/config';
import { ProductMark, PRODUCT_IDS, type ProductId } from './ProductMark';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { cn } from '../lib/cn';
import type { TranslationKey } from '../i18n/translations';

const UMBRELLA = `${import.meta.env.BASE_URL}../`;

export function useCurrentProduct(): ProductId | undefined {
  const { pathname } = useLocation();
  const seg = pathname.replace(/^\//, '');
  return PRODUCT_IDS.find((id) => id === seg);
}

export function SideNav() {
  const { t } = useI18n();
  return (
    <aside
      className="sticky top-0 flex h-screen w-14 shrink-0 flex-col items-center gap-1 border-r border-rule bg-neu-raised py-4 sm:w-56 sm:items-stretch sm:px-3"
      aria-label="Betriebsamt"
    >
      <Link to="/" className="mb-4 flex items-center justify-center gap-2.5 px-1 sm:justify-start">
        <ProductMark product="suite" className="h-9 w-9 shrink-0" />
        <span className="hidden font-display text-base font-semibold tracking-tight text-ink sm:inline">
          Betriebsamt
        </span>
      </Link>

      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn(
            'flex items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors sm:justify-start sm:px-3',
            isActive ? 'bg-uhr-soft text-uhr' : 'text-ink-soft hover:text-ink'
          )
        }
      >
        <Home className="h-5 w-5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{t('nav.home')}</span>
      </NavLink>

      {PRODUCT_IDS.map((id) => (
        <NavLink
          key={id}
          to={`/${id}`}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors sm:justify-start sm:px-3',
              isActive ? 'bg-uhr-soft text-uhr' : 'text-ink-soft hover:text-ink'
            )
          }
        >
          <ProductMark product={id} className="h-7 w-7 shrink-0" />
          <span className="hidden sm:inline">{t(`product.${id}.name` as TranslationKey)}</span>
        </NavLink>
      ))}

      <div className="mt-6 border-t border-rule pt-3">
        <p className="mb-1 hidden px-3 text-[10px] font-semibold uppercase tracking-wide text-subtle sm:block">
          {t('nav.flagships')}
        </p>
        <a href={`${import.meta.env.BASE_URL}../`} className="flex items-center justify-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:justify-start sm:px-3">
          <Clock className="h-4 w-4 shrink-0 text-uhr" aria-hidden />
          <span className="hidden sm:inline">Lieferuhr Einkauf</span>
        </a>
        <a href={`${import.meta.env.BASE_URL}../fleet/`} className="flex items-center justify-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:justify-start sm:px-3">
          <Truck className="h-4 w-4 shrink-0 text-fracht" aria-hidden />
          <span className="hidden sm:inline">FrachtRadar</span>
        </a>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 sm:items-stretch">
        {isDemoMode && (
          <a
            href={UMBRELLA}
            className="flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-subtle transition-colors hover:text-ink sm:justify-start sm:px-3"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('suite.back')}</span>
          </a>
        )}
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const { t } = useI18n();
  const product = useCurrentProduct();
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-rule bg-neu-bg/80 px-5 py-3 backdrop-blur-sm sm:px-8">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="font-medium text-subtle">Betriebsamt</span>
        {product && (
          <>
            <span className="text-subtle">/</span>
            <span className="truncate font-display font-semibold text-ink">
              {t(`product.${product}.name` as TranslationKey)}
            </span>
            <span className="hidden text-subtle lg:inline">
              · {t(`product.${product}.for` as TranslationKey)}
            </span>
          </>
        )}
      </div>
      <div className="sm:hidden">
        <LanguageToggle />
      </div>
    </div>
  );
}
