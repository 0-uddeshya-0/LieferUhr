import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Check,
  Camera,
  Mail,
  PackageCheck,
  Plug,
  ShieldCheck,
  Truck,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import type { TranslationKey } from '../i18n/translations';

// Pilot inquiries land here — replace when a dedicated company address exists.
const PILOT_CONTACT = 'amisha223singh@gmail.com';

// The fleet app deploys beside this one on the same Pages site.
const FLEET_BASE = `${import.meta.env.BASE_URL}fleet/`;

const STEPS: Array<{ title: TranslationKey; desc: TranslationKey; icon: typeof Upload }> = [
  { icon: Upload, title: 'landing.how.step1.title', desc: 'landing.how.step1.desc' },
  { icon: Mail, title: 'landing.how.step2.title', desc: 'landing.how.step2.desc' },
  { icon: Bell, title: 'landing.how.step3.title', desc: 'landing.how.step3.desc' },
];

const EINKAUF_POINTS: TranslationKey[] = [
  'landing.einkauf.f1',
  'landing.einkauf.f2',
  'landing.einkauf.f3',
];

const FRACHT_POINTS: TranslationKey[] = [
  'landing.fracht.f1',
  'landing.fracht.f2',
  'landing.fracht.f3',
];

// Miniature of the Einkauf dashboard — order rows with risk dots.
function EinkaufMock() {
  const { t } = useI18n();
  const rows: Array<{ no: string; status: TranslationKey; dot: string }> = [
    { no: 'PO-118', status: 'orderStatus.DELAYED', dot: 'bg-risk-red' },
    { no: 'PO-120', status: 'orderStatus.IN_PROGRESS', dot: 'bg-risk-yellow' },
    { no: 'PO-122', status: 'orderStatus.SHIPPED', dot: 'bg-risk-green' },
  ];
  return (
    <div className="neu-well p-3.5" aria-hidden>
      <div className="flex items-center gap-1.5 pb-2.5">
        <span className="w-2 h-2 rounded-full bg-neu-muted/40" />
        <span className="w-2 h-2 rounded-full bg-neu-muted/40" />
        <span className="w-2 h-2 rounded-full bg-neu-muted/40" />
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.no}
            className="flex items-center justify-between bg-neu-raised rounded-lg shadow-neu-sm px-3 py-2"
          >
            <span className="font-mono text-xs text-brand-700">{row.no}</span>
            <span className="text-xs text-neu-muted">{t(row.status)}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Miniature of the FrachtRadar driver screen — the one-tap status flow.
function DriverMock() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-44 rounded-2xl bg-neu-sunken/70 shadow-neu-inset p-2" aria-hidden>
      <div className="rounded-xl bg-neu-bg shadow-neu-sm p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-fracht-600" />
          <span className="text-[10px] font-semibold text-neu-muted">BG-1042</span>
        </div>
        <div className="rounded-lg bg-fracht-600 py-2 text-center text-[11px] font-semibold text-white flex items-center justify-center gap-1">
          <PackageCheck className="w-3.5 h-3.5" />
          {t('demo.mock.pickedUp')}
        </div>
        <div className="rounded-lg bg-neu-sunken/70 shadow-neu-inset-sm py-2 text-center text-[11px] text-neu-muted flex items-center justify-center gap-1">
          <Camera className="w-3.5 h-3.5" />
          {t('demo.mock.pod')}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-neu-bg/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <BrandMark className="w-8 h-8" />
            <span className="text-xl font-bold text-brand-900 font-display">Lieferuhr</span>
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/dashboard">
              <Button size="sm">
                {t('landing.cta.demo')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-neu-text tracking-tight leading-[1.08] text-balance">
              {t('landing.hero.title')}
            </h1>
            <p className="mt-6 text-lg text-neu-muted max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.sub')}
            </p>
            <p className="mt-6 text-xs font-medium text-neu-muted tracking-wide">
              {t('landing.hero.note')}
            </p>
          </motion.div>
        </section>

        {/* The two products — equal panels, each with its own accent and demo */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neu-text">
              {t('landing.products.title')}
            </h2>
            <p className="mt-2 text-neu-muted">{t('landing.products.sub')}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="neu-card p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-center gap-3">
                <span className="neu-raised w-11 h-11 flex items-center justify-center">
                  <BrandMark className="w-7 h-7" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-xl text-neu-text">
                    {t('landing.einkauf.name')}
                  </h3>
                  <p className="text-sm text-brand-700 font-medium">{t('landing.einkauf.audience')}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row gap-5">
                <p className="text-neu-muted leading-relaxed flex-1">{t('landing.einkauf.desc')}</p>
                <div className="sm:w-56 shrink-0"><EinkaufMock /></div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {EINKAUF_POINTS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-neu-text">
                    <span className="neu-raised w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-brand-600" />
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-neu-sunken flex flex-col sm:flex-row gap-3 mt-auto">
                <Link to="/dashboard">
                  <Button>
                    {t('landing.einkauf.demo')}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/s/demo" className="self-center">
                  <Button variant="ghost" size="sm">
                    {t('landing.einkauf.demoAlt')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
              className="neu-card p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-center gap-3">
                <span className="neu-raised w-11 h-11 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-7 h-7" aria-hidden>
                    <rect width="64" height="64" rx="14" fill="#ea580c" />
                    <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 24h26v20H10z" />
                      <path d="M36 30h7l7 7v7H36z" />
                      <circle cx="18" cy="47" r="4" />
                      <circle cx="43" cy="47" r="4" />
                      <path d="M42 10a14 14 0 0 1 14 14" opacity="0.45" />
                      <path d="M42 17a7 7 0 0 1 7 7" opacity="0.7" />
                    </g>
                    <circle cx="42" cy="24" r="2.5" fill="#fff" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display font-bold text-xl text-neu-text">
                    {t('landing.fracht.name')}
                    <span className="ml-2 text-sm font-medium text-neu-muted">{t('landing.fracht.by')}</span>
                  </h3>
                  <p className="text-sm text-fracht-700 font-medium">{t('landing.fracht.audience')}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row gap-5">
                <p className="text-neu-muted leading-relaxed flex-1">{t('landing.fracht.desc')}</p>
                <div className="sm:w-56 shrink-0"><DriverMock /></div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {FRACHT_POINTS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-neu-text">
                    <span className="neu-raised w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-fracht-600" />
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-neu-sunken mt-auto">
                <div className="flex flex-wrap items-center gap-3">
                  <a href={FLEET_BASE}>
                    <Button className="!bg-fracht-600 hover:!bg-fracht-500 active:!bg-fracht-700">
                      {t('landing.fracht.demo')}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </a>
                  <a
                    href={`${FLEET_BASE}#/t/demo`}
                    className="text-sm font-medium text-fracht-700 hover:underline"
                  >
                    {t('landing.fracht.demoDriver')}
                  </a>
                  <a
                    href={`${FLEET_BASE}#/l/demo`}
                    className="text-sm font-medium text-fracht-700 hover:underline"
                  >
                    {t('landing.fracht.demoTrack')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The connective tissue — one line explaining the umbrella */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="neu-well p-6 md:p-8 flex items-start gap-5">
            <span className="neu-raised w-10 h-10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-neu-text">{t('landing.why.title')}</h2>
              <p className="mt-2 text-neu-muted leading-relaxed max-w-3xl">{t('landing.why.desc')}</p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-neu-text text-center mb-12">
            {t('landing.how.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="neu-card inline-flex items-center justify-center w-14 h-14 mb-5 relative">
                  <step.icon className="w-6 h-6 text-brand-600" />
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-neu-text">{t(step.title)}</h3>
                <p className="text-sm text-neu-muted mt-2 max-w-xs mx-auto leading-relaxed">{t(step.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="neu-card p-6 md:p-8 flex items-start gap-5">
            <span className="neu-raised w-10 h-10 flex items-center justify-center shrink-0">
              <Plug className="w-5 h-5 text-brand-600" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-neu-text">{t('landing.integrations.title')}</h2>
              <p className="mt-2 text-neu-muted leading-relaxed max-w-3xl">{t('landing.integrations.desc')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['REST API', 'Webhooks', 'n8n · Make · Zapier', t('landing.integrations.mcp'), 'CSV', t('landing.integrations.erp')].map((chip) => (
                  <span key={chip} className="neu-raised px-3 py-1 text-xs font-medium text-neu-muted">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="neu-card p-8 md:p-10 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neu-text">{t('landing.pilot.title')}</h2>
            <p className="mt-3 text-neu-muted max-w-2xl mx-auto leading-relaxed">{t('landing.pilot.desc')}</p>
            <a href={`mailto:${PILOT_CONTACT}?subject=Lieferuhr%20Pilot`} className="inline-block mt-6">
              <Button size="lg">
                {t('landing.pilot.cta')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <p className="mt-4 text-xs text-neu-muted">{t('landing.pilot.note')}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-neu-sunken">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-neu-muted">
          <p>
            {t('landing.footer.full')}{' '}
            <a
              href="https://github.com/0-uddeshya-0/lieferradar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 hover:underline"
            >
              {t('landing.footer.repo')}
            </a>
          </p>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
