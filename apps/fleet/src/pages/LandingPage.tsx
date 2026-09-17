import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';
import { isDemoMode } from '../demo/config';
import type { TranslationKey } from '../i18n/translations';

// Umbrella site sits one level up in the Pages deploy.
const UMBRELLA = `${import.meta.env.BASE_URL}../`;
const TOUR = `${import.meta.env.BASE_URL}tour/`;

type TourStop = { img: string; kicker: TranslationKey; caption: TranslationKey; alt: string; tall?: boolean };

const TOUR_STOPS: TourStop[] = [
  { img: 'dispatch.png', kicker: 'landing.tour1.kicker', caption: 'landing.tour1.caption', alt: 'FrachtRadar dispatch board with tours, drivers and statuses' },
  { img: 'driver.png', kicker: 'landing.tour2.kicker', caption: 'landing.tour2.caption', alt: 'Driver view on a phone: pickup confirmation and POD photo upload', tall: true },
  { img: 'tracking.png', kicker: 'landing.tour3.kicker', caption: 'landing.tour3.caption', alt: 'Public tracking page showing the shipment status timeline' },
  { img: 'invoice.png', kicker: 'landing.tour4.kicker', caption: 'landing.tour4.caption', alt: 'Invoice list generated from delivered tours' },
];

function DemoLinks({ primary }: { primary: boolean }) {
  const { t } = useI18n();
  if (!isDemoMode) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px"
      >
        {t('landing.cta.primary')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        to="/dispatch"
        className={`inline-flex items-center gap-2 rounded-full bg-accent font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px ${primary ? 'px-6 py-3 text-sm' : 'px-5 py-2.5 text-sm'}`}
      >
        {t('landing.cta.demoDispatch')}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link to="/t/demo" className="clay-pill inline-flex items-center px-5 py-2.5 text-sm font-medium text-ink">
        {t('landing.cta.demoDriver')}
      </Link>
      <Link to="/l/demo" className="clay-pill inline-flex items-center px-5 py-2.5 text-sm font-medium text-ink">
        {t('landing.cta.demoTrack')}
      </Link>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-paper text-ink" id="top">
      {/* N9 edge-aligned nav — the space between wordmark and CTA is the design */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <a href={UMBRELLA} className="flex items-center gap-2.5" aria-label="Lieferuhr">
          <BrandMark className="h-7 w-7" />
          <span className="font-display text-base font-semibold text-ink">
            FrachtRadar <span className="text-sm font-normal text-subtle">{t('landing.byLieferuhr')}</span>
          </span>
        </a>
        <div className="flex items-center gap-3 sm:gap-4">
          {isDemoMode && (
            <a
              href={UMBRELLA}
              className="hidden items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink min-[480px]:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Lieferuhr
            </a>
          )}
          <LanguageToggle />
          {!isDemoMode && (
            <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
              {t('landing.login')}
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero — functional, left-biased; Workbench doesn't shout */}
        <section className="mx-auto max-w-5xl px-5 pb-12 pt-16 sm:px-8 md:pt-24">
          <p className="reveal font-mono text-[11px] uppercase tracking-[0.14em] text-accent" style={{ ['--i' as string]: 0 }}>
            {t('landing.badge')}
          </p>
          <h1
            className="reveal mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl"
            style={{ ['--i' as string]: 1 }}
          >
            {t('landing.hero.line1')} <span className="text-accent">{t('landing.hero.line2')}</span>
          </h1>
          <p className="reveal mt-5 max-w-xl text-lg leading-relaxed text-ink-soft" style={{ ['--i' as string]: 2 }}>
            {t('landing.hero.sub')}
          </p>
          <div className="reveal mt-7" style={{ ['--i' as string]: 3 }}>
            <DemoLinks primary />
          </div>
        </section>

        {/* The tour — real screenshots of the running product */}
        <section className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{t('landing.tour.title')}</h2>
            <p className="mt-2 text-ink-soft">{t('landing.tour.sub')}</p>
          </div>

          <div className="space-y-14">
            {TOUR_STOPS.map((stop, i) => (
              <figure
                key={stop.img}
                className={`grid items-center gap-6 md:gap-10 ${stop.tall ? 'md:grid-cols-[1fr_1.2fr]' : 'md:grid-cols-[1.35fr_1fr]'} ${i % 2 === 1 ? '' : ''}`}
              >
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="clay-card overflow-hidden p-2">
                    <img
                      src={`${TOUR}${stop.img}`}
                      alt={stop.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className={`w-full rounded-xl border border-rule ${stop.tall ? 'mx-auto max-w-[300px]' : ''}`}
                    />
                  </div>
                </div>
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                    {String(i + 1).padStart(2, '0')} · {t(stop.kicker)}
                  </p>
                  <p className="mt-3 text-lg font-medium leading-relaxed text-ink">{t(stop.caption)}</p>
                </div>
              </figure>
            ))}
          </div>
        </section>

        {/* How it starts — compact, single row */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <div className="grid gap-8 border-t border-rule pt-10 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                  {t(`landing.how.step${i}.title` as TranslationKey)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.how.step${i}.desc` as TranslationKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pilot */}
        <section className="mx-auto max-w-5xl px-5 pb-28 sm:px-8">
          <div className="clay-inset px-6 py-12 md:px-14">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {t('landing.pilot.title')}
                </h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{t('landing.pilot.desc')}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{t('landing.pilot.note')}</p>
              </div>
              <DemoLinks primary={false} />
            </div>
          </div>
        </section>
      </main>

      {/* Ft2 inline-rule footer */}
      <footer className="border-t border-rule px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-5xl text-sm text-subtle">{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
