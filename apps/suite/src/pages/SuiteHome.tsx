import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';
import { ProductMark, PRODUCT_IDS, EXPERIMENT_IDS, type ProductId } from '../components/ProductMark';
import type { TranslationKey } from '../i18n/translations';

const TONE_TEXT: Record<ProductId, string> = {
  suite: 'text-uhr',
  frachtamt: 'text-dispatch',
  pruefamt: 'text-comply',
  einsatzamt: 'text-hvac',
  postamt: 'text-depot',
};

export default function SuiteHome() {
  const { t } = useI18n();
  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
      <p className="mx-auto w-fit rounded-full bg-neu-raised px-4 py-1.5 text-xs font-medium text-ink-soft shadow-neu-sm">
        {t('home.hero.badge')}
      </p>
      <h1 className="mt-6 text-center font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-6xl">
        {t('home.hero.title1')}
        <br />
        {t('home.hero.title2')}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-ink-soft sm:text-lg">
        {t('home.hero.sub')}
      </p>

      <div className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink">
          {t('home.flagship.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-ink-soft">{t('home.flagship.sub')}</p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-5 sm:grid-cols-2">
          <a
            href={`${import.meta.env.BASE_URL}../`}
            className="group rounded-2xl bg-neu-raised p-6 shadow-neu transition-all hover:shadow-neu-lg focus:outline-none focus:ring-2 focus:ring-uhr"
          >
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">Lieferuhr Einkauf</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t('home.flagship.einkauf.desc')}</p>
            <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-uhr">
              {t('home.cta')}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
          <a
            href={`${import.meta.env.BASE_URL}../fleet/`}
            className="group rounded-2xl bg-neu-raised p-6 shadow-neu transition-all hover:shadow-neu-lg focus:outline-none focus:ring-2 focus:ring-uhr"
          >
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">FrachtRadar</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t('home.flagship.fracht.desc')}</p>
            <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-uhr">
              {t('home.cta')}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink">
          {t('home.section')}
        </h2>
        <p className="mt-2 text-center text-sm text-ink-soft">{t('home.sectionSub')}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {PRODUCT_IDS.map((id) => {
            const name = t(`product.${id}.name` as TranslationKey);
            return (
              <Link
                key={id}
                to={`/${id}`}
                aria-label={`${name} — ${t('home.cta')}`}
                className="group relative block rounded-2xl bg-neu-raised p-6 shadow-neu transition-all hover:shadow-neu-lg focus:outline-none focus:ring-2 focus:ring-uhr"
              >
                <div className="flex items-start justify-between gap-4">
                  <ProductMark product={id} className="h-11 w-11" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neu-inset text-subtle shadow-neu-in transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">{name}</h3>
                <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${TONE_TEXT[id]}`}>
                  {t(`product.${id}.for` as TranslationKey)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {t(`product.${id}.desc` as TranslationKey)}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {(['f1', 'f2', 'f3'] as const).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink">
                      <span className={`h-1.5 w-1.5 rounded-full ${TONE_TEXT[id].replace('text-', 'bg-')}`} />
                      {t(`product.${id}.${f}` as TranslationKey)}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-display text-lg font-bold tracking-tight text-subtle">
          {t('home.experiment.title')}
        </h2>
        <p className="mt-1.5 text-center text-xs text-subtle">{t('home.experiment.sub')}</p>
        <div className="mx-auto mt-5 max-w-md">
          {EXPERIMENT_IDS.map((id) => (
            <Link
              key={id}
              to={`/${id}`}
              aria-label={`${t(`product.${id}.name` as TranslationKey)} — ${t('home.cta')}`}
              className="group flex items-center gap-4 rounded-2xl bg-neu-raised p-4 shadow-neu-sm transition-all hover:shadow-neu focus:outline-none focus:ring-2 focus:ring-uhr"
            >
              <ProductMark product={id} className="h-9 w-9 opacity-80" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                  {t(`product.${id}.name` as TranslationKey)}
                  <span className="rounded-full bg-neu-inset px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-subtle shadow-neu-in">
                    {t('home.experiment.badge')}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-soft">
                  {t(`product.${id}.for` as TranslationKey)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-3xl rounded-2xl bg-neu-inset p-6 text-center shadow-neu-in sm:p-8">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">{t('home.integration.title')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t('home.integration.desc')}</p>
      </section>
      </main>
    </>
  );
}
