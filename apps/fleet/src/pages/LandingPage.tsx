import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Smartphone, MapPin, Camera, FileText, CalendarClock } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import { BrandMark } from '../components/BrandMark';

const FEATURE_ICONS = [ClipboardList, Smartphone, MapPin, Camera, FileText, CalendarClock];

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark />
            <span className="text-lg font-bold text-brand-900">FrachtRadar</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('landing.login')}
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-4">
          {t('landing.badge')}
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
          {t('landing.hero.line1')}
          <br />
          <span className="text-brand-600">{t('landing.hero.line2')}</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">{t('landing.hero.sub')}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700"
          >
            {t('landing.cta.primary')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {FEATURE_ICONS.map((Icon, i) => (
            <div key={i} className="bg-white rounded-xl border p-6">
              <Icon className="w-8 h-8 text-brand-600 mb-3" />
              <h3 className="font-semibold text-gray-900">{t(`landing.feature${i + 1}.title` as never)}</h3>
              <p className="text-sm text-gray-600 mt-2">{t(`landing.feature${i + 1}.desc` as never)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-display font-bold text-center mb-10">{t('landing.how.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mx-auto mb-4">
                {i}
              </div>
              <h3 className="font-semibold">{t(`landing.how.step${i}.title` as never)}</h3>
              <p className="text-sm text-gray-600 mt-2">{t(`landing.how.step${i}.desc` as never)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold">{t('landing.pilot.title')}</h2>
          <p className="mt-4 text-brand-100">{t('landing.pilot.desc')}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 bg-white text-brand-900 px-6 py-3 rounded-lg font-medium hover:bg-brand-50"
          >
            {t('landing.pilot.cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-brand-200">{t('landing.pilot.note')}</p>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        {t('landing.footer')}
      </footer>
    </div>
  );
}
