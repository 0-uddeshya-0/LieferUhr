import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardList, Smartphone, MapPin, Camera, FileText, CalendarClock } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';
import { isDemoMode } from '../demo/config';

const FEATURE_ICONS = [ClipboardList, Smartphone, MapPin, Camera, FileText, CalendarClock];

// Umbrella site sits one level up in the Pages deploy.
const UMBRELLA = `${import.meta.env.BASE_URL}../`;

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <header className="bg-neu-bg/85 backdrop-blur-md shadow-neu-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-bold text-brand-900 font-display">
              FrachtRadar <span className="text-sm font-medium text-neu-muted">{t('landing.byLieferuhr')}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isDemoMode && (
              <a href={UMBRELLA} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-uhr-700 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Lieferuhr
              </a>
            )}
            <LanguageToggle />
            {!isDemoMode && (
              <Link to="/login" className="text-sm font-medium text-neu-muted hover:text-neu-text">
                {t('landing.login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center">
        <p className="text-xs font-medium text-neu-muted tracking-wide mb-5">
          {t('landing.badge')}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-neu-text leading-[1.08] text-balance">
          {t('landing.hero.line1')}
          <br />
          <span className="text-brand-700">{t('landing.hero.line2')}</span>
        </h1>
        <p className="mt-6 text-lg text-neu-muted max-w-2xl mx-auto leading-relaxed">{t('landing.hero.sub')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isDemoMode ? (
            <>
              <Link
                to="/dispatch"
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium shadow-neu-sm hover:bg-brand-500 active:shadow-neu-inset-sm"
              >
                {t('landing.cta.demoDispatch')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/t/demo" className="neu-btn inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-neu-text">
                {t('landing.cta.demoDriver')}
              </Link>
              <Link to="/l/demo" className="neu-btn inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-neu-text">
                {t('landing.cta.demoTrack')}
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium shadow-neu-sm hover:bg-brand-500 active:shadow-neu-inset-sm"
            >
              {t('landing.cta.primary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {FEATURE_ICONS.map((Icon, i) => (
            <div key={i} className="flex gap-4">
              <span className="neu-raised w-10 h-10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-600" />
              </span>
              <div>
                <h3 className="font-semibold text-neu-text">{t(`landing.feature${i + 1}.title` as never)}</h3>
                <p className="text-sm text-neu-muted mt-1 leading-relaxed">{t(`landing.feature${i + 1}.desc` as never)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-display font-bold text-center text-neu-text mb-10">{t('landing.how.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="neu-card w-12 h-12 flex items-center justify-center mx-auto mb-4 font-display font-bold text-brand-700">
                {i}
              </div>
              <h3 className="font-semibold text-neu-text">{t(`landing.how.step${i}.title` as never)}</h3>
              <p className="text-sm text-neu-muted mt-2 max-w-xs mx-auto leading-relaxed">{t(`landing.how.step${i}.desc` as never)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="neu-card p-8 md:p-10 text-center">
          <h2 className="text-2xl font-display font-bold text-neu-text">{t('landing.pilot.title')}</h2>
          <p className="mt-4 text-neu-muted max-w-2xl mx-auto leading-relaxed">{t('landing.pilot.desc')}</p>
          <Link
            to={isDemoMode ? '/dispatch' : '/login'}
            className="mt-6 inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium shadow-neu-sm hover:bg-brand-500 active:shadow-neu-inset-sm"
          >
            {isDemoMode ? t('landing.cta.demoDispatch') : t('landing.pilot.cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-neu-muted">{t('landing.pilot.note')}</p>
        </div>
      </section>

      <footer className="border-t border-neu-sunken py-8 text-center text-sm text-neu-muted">
        {t('landing.footer')}
      </footer>
    </div>
  );
}
